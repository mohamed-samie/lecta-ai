from sqlalchemy import ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.session import Base


class DocumentChunk(Base):
    __tablename__ = "document_chunks"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    parsed_document_id: Mapped[int] = mapped_column(ForeignKey("parsed_documents.id"), index=True)
    chunk_index: Mapped[int] = mapped_column(index=True)
    chunk_text: Mapped[str] = mapped_column(Text)
    embedding_json: Mapped[str] = mapped_column(Text)