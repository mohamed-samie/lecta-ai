from datetime import datetime, timezone

from sqlalchemy import ForeignKey, Text, Float, DateTime
from sqlalchemy.orm import Mapped, mapped_column

from app.db.session import Base


class ExamAttempt(Base):
    __tablename__ = "exam_attempts"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    generated_exam_id: Mapped[int] = mapped_column(ForeignKey("generated_exams.id"), index=True)
    submission_json: Mapped[str] = mapped_column(Text)
    grading_json: Mapped[str] = mapped_column(Text)
    feedback_json: Mapped[str] = mapped_column(Text)
    score: Mapped[float] = mapped_column(Float, default=0.0)
    accuracy: Mapped[float] = mapped_column(Float, default=0.0)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
