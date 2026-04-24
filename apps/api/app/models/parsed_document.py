from sqlalchemy import ForeignKey, Text, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.session import Base


class ParsedDocument(Base):
    __tablename__ = "parsed_documents"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    uploaded_file_id: Mapped[int] = mapped_column(ForeignKey("uploaded_files.id"), index=True)
    raw_text: Mapped[str] = mapped_column(Text)
    detected_language: Mapped[str] = mapped_column(String(50), default="unknown")