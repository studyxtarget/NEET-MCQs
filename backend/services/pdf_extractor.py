"""
Handles reading an uploaded PDF and pulling out clean text.
Uses PyMuPDF (fitz) because it's fast and handles most NCERT/PYQ-style
PDFs (including two-column layouts) reasonably well.
"""
import fitz  # PyMuPDF
from pathlib import Path


class PDFExtractionError(Exception):
    pass


def extract_text_from_pdf(file_path: str) -> dict:
    """
    Extracts text from every page of a PDF.

    Returns:
        {
            "text": "<full concatenated text>",
            "pages": <int>,
            "char_count": <int>
        }
    """
    path = Path(file_path)
    if not path.exists():
        raise PDFExtractionError(f"File not found: {file_path}")

    try:
        doc = fitz.open(file_path)
    except Exception as e:
        raise PDFExtractionError(f"Could not open PDF: {e}")

    full_text = []
    for page in doc:
        # "text" mode preserves reading order reasonably well for
        # two-column exam-paper layouts. If output looks scrambled for a
        # given PDF, try page.get_text("blocks") and sort by (y, x) instead.
        page_text = page.get_text("text")
        full_text.append(page_text)

    doc.close()

    combined = "\n".join(full_text)
    combined = _clean_text(combined)

    return {
        "text": combined,
        "pages": len(full_text),
        "char_count": len(combined),
    }


def _clean_text(text: str) -> str:
    """Light cleanup: collapse excess blank lines, strip trailing whitespace."""
    lines = [line.rstrip() for line in text.splitlines()]
    cleaned = []
    blank_streak = 0
    for line in lines:
        if line.strip() == "":
            blank_streak += 1
            if blank_streak > 1:
                continue
        else:
            blank_streak = 0
        cleaned.append(line)
    return "\n".join(cleaned).strip()


def chunk_text(text: str, max_chars: int = 12000) -> list[str]:
    """
    Splits long text into chunks that comfortably fit in one AI prompt.
    Splits on paragraph boundaries where possible, not mid-sentence.
    """
    if len(text) <= max_chars:
        return [text]

    chunks = []
    current = []
    current_len = 0
    for para in text.split("\n\n"):
        para_len = len(para) + 2
        if current_len + para_len > max_chars and current:
            chunks.append("\n\n".join(current))
            current, current_len = [], 0
        current.append(para)
        current_len += para_len
    if current:
        chunks.append("\n\n".join(current))
    return chunks
