import os
import uuid
import shutil
from pathlib import Path

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from models.schemas import (
    UploadResponse,
    GenerateRequest,
    GenerateResponse,
    MCQ,
    SubmitRequest,
    SubmitResponse,
    TopicBreakdown,
)
from services.pdf_extractor import extract_text_from_pdf, PDFExtractionError
from services.ai_generator import generate_mcqs, AIGenerationError

app = FastAPI(title="NEET MCQ Generator API", version="0.1.0")

# Allow the frontend dev server to call this API. Tighten this before
# deploying publicly (restrict to your real frontend domain).
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

STORAGE_DIR = Path("storage")
STORAGE_DIR.mkdir(exist_ok=True)

# In-memory store for the MVP. Swap for Redis/Postgres/Firebase once this
# needs to survive server restarts or run across multiple instances.
DOCUMENTS: dict[str, dict] = {}   # doc_id -> {"text": str, "filename": str}
QUIZZES: dict[str, list[MCQ]] = {}  # doc_id -> list of MCQ (with correct answers)


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/upload", response_model=UploadResponse)
async def upload_pdf(file: UploadFile = File(...)):
    if file.content_type != "application/pdf":
        raise HTTPException(400, "Only PDF files are supported.")

    doc_id = str(uuid.uuid4())
    dest_path = STORAGE_DIR / f"{doc_id}.pdf"

    with dest_path.open("wb") as f:
        shutil.copyfileobj(file.file, f)

    try:
        result = extract_text_from_pdf(str(dest_path))
    except PDFExtractionError as e:
        dest_path.unlink(missing_ok=True)
        raise HTTPException(422, str(e))
    finally:
        # We already extracted the text; no need to keep the raw PDF around.
        dest_path.unlink(missing_ok=True)

    if result["char_count"] < 50:
        raise HTTPException(
            422,
            "Almost no text could be extracted. The PDF may be scanned images "
            "rather than selectable text -- try an OCR'd version.",
        )

    DOCUMENTS[doc_id] = {"text": result["text"], "filename": file.filename}

    return UploadResponse(
        doc_id=doc_id,
        filename=file.filename,
        pages=result["pages"],
        char_count=result["char_count"],
        preview=result["text"][:300],
    )


@app.post("/generate", response_model=GenerateResponse)
def generate_quiz(req: GenerateRequest):
    doc = DOCUMENTS.get(req.doc_id)
    if not doc:
        raise HTTPException(404, "Unknown doc_id. Upload the PDF first via /upload.")

    try:
        raw_questions = generate_mcqs(
            text=doc["text"],
            mode=req.mode,
            num_questions=req.num_questions,
            difficulty=req.difficulty,
            subject=req.subject,
            chapter=req.chapter,
        )
    except AIGenerationError as e:
        raise HTTPException(502, f"AI generation failed: {e}")

    mcqs = [MCQ(**q) for q in raw_questions]
    QUIZZES[req.doc_id] = mcqs

    return GenerateResponse(doc_id=req.doc_id, mode=req.mode, questions=mcqs)


@app.post("/submit", response_model=SubmitResponse)
def submit_quiz(req: SubmitRequest):
    mcqs = QUIZZES.get(req.doc_id)
    if not mcqs:
        raise HTTPException(404, "No generated quiz found for this doc_id.")

    topic_stats: dict[str, dict] = {}
    correct_count = 0

    for ans in req.answers:
        if ans.question_index >= len(mcqs):
            continue
        q = mcqs[ans.question_index]
        topic = q.topic or "General"
        topic_stats.setdefault(topic, {"correct": 0, "total": 0})
        topic_stats[topic]["total"] += 1

        is_correct = ans.selected_index == q.correct_index
        if is_correct:
            correct_count += 1
            topic_stats[topic]["correct"] += 1

    total = len(req.answers)
    weak_topics = [
        TopicBreakdown(
            topic=topic,
            correct=stats["correct"],
            total=stats["total"],
            accuracy=round(100 * stats["correct"] / stats["total"], 1),
        )
        for topic, stats in topic_stats.items()
    ]
    weak_topics.sort(key=lambda t: t.accuracy)  # weakest first

    return SubmitResponse(
        score=correct_count,
        total=total,
        percentage=round(100 * correct_count / total, 1) if total else 0.0,
        weak_topics=weak_topics,
    )
