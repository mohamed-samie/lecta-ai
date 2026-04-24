import json

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.dependencies import get_db
from app.models.uploaded_file import UploadedFile
from app.models.parsed_document import ParsedDocument
from app.models.document_chunk import DocumentChunk
from app.services.retriever import retrieve_top_k

router = APIRouter()


@router.post("/semantic")
def semantic_search(
    file_id: int,
    query: str,
    k: int = 3,
    db: Session = Depends(get_db),
):
    uploaded_file = db.query(UploadedFile).filter(UploadedFile.id == file_id).first()

    if not uploaded_file:
        raise HTTPException(status_code=404, detail="Uploaded file not found")

    parsed_doc = (
        db.query(ParsedDocument)
        .filter(ParsedDocument.uploaded_file_id == file_id)
        .order_by(ParsedDocument.id.desc())
        .first()
    )

    if not parsed_doc:
        raise HTTPException(status_code=404, detail="Parsed document not found")

    chunks = (
        db.query(DocumentChunk)
        .filter(DocumentChunk.parsed_document_id == parsed_doc.id)
        .order_by(DocumentChunk.chunk_index.asc())
        .all()
    )

    if not chunks:
        raise HTTPException(status_code=404, detail="No chunks found for this document")

    embedded_chunks = [
        {
            "text": chunk.chunk_text,
            "embedding": json.loads(chunk.embedding_json),
        }
        for chunk in chunks
    ]

    results = retrieve_top_k(query=query, embedded_chunks=embedded_chunks, k=k)

    return {
        "file_id": uploaded_file.id,
        "filename": uploaded_file.filename,
        "parsed_document_id": parsed_doc.id,
        "query": query,
        "top_k": k,
        "results": [
            {
                "score": item["score"],
                "text": item["text"],
            }
            for item in results
        ],
    }