from typing import Literal

from pydantic import BaseModel, field_validator, model_validator


class ExamQuestion(BaseModel):
    type: Literal["mcq"]
    question: str
    choices: list[str]
    answer: str

    @field_validator("question", "answer")
    @classmethod
    def non_empty_text(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Field cannot be empty")
        return v

    @field_validator("choices")
    @classmethod
    def clean_choices(cls, v: list[str]) -> list[str]:
        cleaned = []
        for item in v:
            item = item.strip()
            if item and item not in cleaned:
                cleaned.append(item)
        return cleaned

    @model_validator(mode="after")
    def validate_mcq(self):
        if len(self.choices) != 4:
            raise ValueError("MCQ must include exactly 4 choices")

        if self.answer.strip() not in self.choices:
            raise ValueError("MCQ answer must match one of the choices")

        return self


class GeneratedExam(BaseModel):
    questions: list[ExamQuestion]

    @field_validator("questions")
    @classmethod
    def validate_questions(cls, v: list[ExamQuestion]):
        if not v:
            raise ValueError("Exam must include at least one question")
        return v