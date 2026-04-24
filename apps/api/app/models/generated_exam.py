from datetime import datetime, timezone

from sqlalchemy import ForeignKey, Text, Integer, DateTime
from sqlalchemy.orm import Mapped, mapped_column

from app.db.session import Base


class GeneratedExamRecord(Base):
    __tablename__ = "generated_exams"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    session_id: Mapped[int] = mapped_column(ForeignKey("study_sessions.id"), index=True)
    exam_json: Mapped[str] = mapped_column(Text)
    question_count: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
