from typing import Literal, Optional

from pydantic import BaseModel, field_validator


class SubmittedAnswer(BaseModel):
    question_index: int
    answer: str

    @field_validator("answer")
    @classmethod
    def non_empty_answer(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Answer cannot be empty")
        return v


class ExamSubmission(BaseModel):
    session_id: int
    exam_id: int  # ID returned by /exam/generate — required to grade correct questions
    answers: list[SubmittedAnswer]


class GradedQuestion(BaseModel):
    question_index: int
    question_type: Literal["mcq", "short_answer"]
    question: str
    student_answer: str
    correct_answer: str
    is_correct: bool
    awarded_score: float
    max_score: float
    explanation: str
    weak_topic_tags: list[str] = []


class ExamGradingResult(BaseModel):
    session_id: int
    total_score: float
    max_score: float
    accuracy: float
    graded_questions: list[GradedQuestion]
    weak_areas_summary: list[str] = []

