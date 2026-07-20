"""
Calls the Gemini API to turn raw study-material text into structured MCQs.

Two modes:
  - EXTRACT_EXISTING: the PDF already contains real PYQs (like a PYQ bank).
    The model's job is to faithfully parse/reformat them into our JSON
    schema -- NOT invent new questions or change facts.
  - GENERATE_NEW: the PDF is NCERT text / class notes. The model writes
    fresh NEET-style MCQs grounded only in the given material.
"""
import os
import json
import re
from google import genai
from google.genai import types
from models.schemas import GenerationMode, Difficulty

client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))

# gemini-2.5-flash is Google's current price/performance workhorse model.
MODEL = "gemini-2.5-flash-lite"

EXTRACT_SYSTEM_PROMPT = """You are formatting an existing bank of NEET previous-year \
questions (PYQs) into structured JSON. Do not invent new questions, do not change \
any facts, options, or answers. Only reformat what is literally present in the \
source text. If a question's correct answer is not explicitly given in the \
source, use your subject knowledge to determine the correct option, but never \
alter the wording of the question or its options.

Return ONLY a JSON array, no prose before or after, matching this shape:
[
  {
    "question": "string",
    "options": ["A", "B", "C", "D"],
    "correct_index": 0,
    "explanation": "one or two sentence explanation",
    "source_year": "e.g. 2023 or 2021 Re, or null if not shown",
    "topic": "short topic label, e.g. 'ECG', 'Blood groups'"
  }
]"""

GENERATE_SYSTEM_PROMPT = """You are a NEET (biology/physics/chemistry) question \
writer. Based ONLY on the study material provided by the user, write new \
NEET-level multiple choice questions.

Rules:
- Each question has exactly 4 options, exactly one correct.
- Do not introduce facts, numbers, or claims that are not supported by the \
given material or well-established NCERT-level knowledge of the same topic.
- Match the requested difficulty and question count as closely as possible.
- Give a short explanation (1-2 sentences) referencing why the answer is correct.
- Assign each question a short topic label for later weak-topic analysis.

Return ONLY a JSON array, no prose before or after, matching this shape:
[
  {
    "question": "string",
    "options": ["A", "B", "C", "D"],
    "correct_index": 0,
    "explanation": "string",
    "source_year": null,
    "topic": "short topic label"
  }
]"""


class AIGenerationError(Exception):
    pass


def generate_mcqs(
    text: str,
    mode: GenerationMode,
    num_questions: int,
    difficulty: Difficulty,
    subject: str,
    chapter: str | None,
) -> list[dict]:
    system_prompt = (
        EXTRACT_SYSTEM_PROMPT
        if mode == GenerationMode.EXTRACT_EXISTING
        else GENERATE_SYSTEM_PROMPT
    )

    user_prompt = f"""Subject: {subject}
Chapter: {chapter or "Not specified"}
Difficulty: {difficulty.value}
Target number of questions: {num_questions}

Study material:
\"\"\"
{text}
\"\"\"

Return the JSON array now."""

    try:
        response = client.models.generate_content(
            model=MODEL,
            contents=user_prompt,
            config=types.GenerateContentConfig(
                system_instruction=system_prompt,
                # Forces Gemini to return clean JSON with no markdown fences
                # or leading/trailing prose -- this is what was missing before
                # and caused intermittent JSON-parse failures.
                response_mime_type="application/json",
                max_output_tokens=8000,
            ),
        )
    except Exception as e:
        raise AIGenerationError(f"Gemini API call failed: {e}")

    raw_text = response.text or ""
    if not raw_text.strip():
        raise AIGenerationError(
            "Gemini returned an empty response (often means it hit the "
            "safety filter, or max_output_tokens was too low for the "
            "requested number of questions -- try fewer questions per call)."
        )

    return _parse_json_array(raw_text)


def _parse_json_array(raw_text: str) -> list[dict]:
    """Strips markdown fences and parses the model's JSON output defensively."""
    cleaned = raw_text.strip()
    cleaned = re.sub(r"^```(json)?", "", cleaned).strip()
    cleaned = re.sub(r"```$", "", cleaned).strip()

    try:
        data = json.loads(cleaned)
    except json.JSONDecodeError as e:
        # Last resort: try to grab the first [...] block in the text
        match = re.search(r"\[.*\]", cleaned, re.DOTALL)
        if not match:
            raise AIGenerationError(f"Could not parse AI response as JSON: {e}")
        data = json.loads(match.group(0))

    # Gemini occasionally wraps the array in an object like {"questions": [...]}
    # even when told not to -- unwrap that case defensively.
    if isinstance(data, dict):
        for key in ("questions", "mcqs", "data"):
            if key in data and isinstance(data[key], list):
                data = data[key]
                break

    if not isinstance(data, list):
        raise AIGenerationError("AI response was valid JSON but not a list")

    for q in data:
        if "options" not in q or len(q["options"]) != 4:
            raise AIGenerationError(f"Malformed question (needs 4 options): {q}")
        if not (0 <= q.get("correct_index", -1) < 4):
            raise AIGenerationError(f"Malformed question (bad correct_index): {q}")

    return data
