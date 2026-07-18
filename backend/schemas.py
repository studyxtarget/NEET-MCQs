from pydantic import BaseModel, Field
from typing import List, Optional
from enum import Enum


class GenerationMode(str, Enum):
    EXTRACT_EXISTING = "extract_existing"   # PDF already has PYQs -> parse & format them
    GENERATE_NEW = "generate_new"           # PDF is NCERT/notes -> AI writes fresh MCQs


class Difficulty(str, Enum):
    EASY = "easy"
    MEDIUM = "medium"
    HARD = "hard"
    MIXED = "mixed"


class UploadResponse(BaseModel):
    doc_id: str
    filename: str
    pages: int
    char_count: int
    preview: str  # first ~300 chars, so frontend can show "looks right?" confirmation


class GenerateRequest(BaseModel):
    doc_id: str
    subject: str = Field(..., examples=["Biology"])
    chapter: Optional[str] = None
    num_questions: int = Field(10, ge=1, le=50)
    difficulty: Difficulty = Difficulty.MEDIUM
    mode: GenerationMode = GenerationMode.GENERATE_NEW


class MCQ(BaseModel):
    question: str
    options: List[str]
    correct_index: int
    explanation: str
    source_year: Optional[str] = None   # populated only in EXTRACT_EXISTING mode
    topic: Optional[str] = None         # used later for weak-topic analysis


class GenerateResponse(BaseModel):
    doc_id: str
    mode: GenerationMode
    questions: List[MCQ]


class SubmitAnswer(BaseModel):
    question_index: int
    selected_index: int


class SubmitRequest(BaseModel):
    doc_id: str
    answers: List[SubmitAnswer]


class TopicBreakdown(BaseModel):
    topic: str
    correct: int
    total: int
    accuracy: float


class SubmitResponse(BaseModel):
    score: int
    total: int
    percentage: float
    weak_topics: List[TopicBreakdown]
