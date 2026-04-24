import os
from uuid import uuid4

from fastapi import APIRouter, UploadFile, File, Depends
from sqlalchemy.orm import Session

from app.db.dependencies import get_db
from app.models.uploaded_file import UploadedFile

router = APIRouter()

UPLOAD_DIR = "uploads"


@router.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    ext = file.filename.split(".")[-1] if "." in file.filename else "bin"
    unique_name = f"{uuid4()}.{ext}"
    file_path = os.path.join(UPLOAD_DIR, unique_name)

    content = await file.read()

    with open(file_path, "wb") as f:
        f.write(content)

    uploaded_file = UploadedFile(
        filename=file.filename,
        file_type="generic_upload",
        storage_path=file_path,
        mime_type=file.content_type or "application/octet-stream",
        size_bytes=len(content),
    )

    db.add(uploaded_file)
    db.commit()
    db.refresh(uploaded_file)

    return {
        "file_id": uploaded_file.id,
        "filename": uploaded_file.filename,
        "stored_as": unique_name,
        "path": uploaded_file.storage_path,
        "mime_type": uploaded_file.mime_type,
        "size_bytes": uploaded_file.size_bytes,
        "extension": ext,
    }