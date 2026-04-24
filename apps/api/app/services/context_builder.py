import json

from sqlalchemy.orm import Session

from app.models.parsed_document import ParsedDocument
from app.models.document_chunk import DocumentChunk
from app.services.retriever import retrieve_top_k


def build_relevant_context_for_file(
    db: Session,
    uploaded_file_id: int,
    query: str,
    k: int = 4,
) -> list[str]:
    parsed_doc = (
        db.query(ParsedDocument)
        .filter(ParsedDocument.uploaded_file_id == uploaded_file_id)
        .order_by(ParsedDocument.id.desc())
        .first()
    )

    if not parsed_doc:
        return []

    chunks = (
        db.query(DocumentChunk)
        .filter(DocumentChunk.parsed_document_id == parsed_doc.id)
        .order_by(DocumentChunk.chunk_index.asc())
        .all()
    )

    if not chunks:
        return []

    embedded_chunks = [
        {
            "text": chunk.chunk_text,
            "embedding": json.loads(chunk.embedding_json),
        }
        for chunk in chunks
    ]

    results = retrieve_top_k(query=query, embedded_chunks=embedded_chunks, k=k)
    return [item["text"] for item in results]