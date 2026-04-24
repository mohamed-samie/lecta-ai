import os
from uuid import uuid4

from fastapi import APIRouter, UploadFile, File, Depends
from sqlalchemy.orm import Session

from app.db.dependencies import get_db
from app.models.uploaded_file import UploadedFile
from app.models.job import Job
from app.tasks.jobs import process_job

router = APIRouter()

UPLOAD_DIR = "uploads"


@router.post("/upload-and-create-job")
async def upload_and_create_job(
    file: UploadFile = File(...),
    job_type: str = "match_exam",
    db: Session = Depends(get_db),
):
    # 1) Save uploaded file
    ext = file.filename.split(".")[-1] if "." in file.filename else "bin"
    unique_name = f"{uuid4()}.{ext}"
    file_path = os.path.join(UPLOAD_DIR, unique_name)

    content = await file.read()

    with open(file_path, "wb") as f:
        f.write(content)

    uploaded_file = UploadedFile(
        filename=file.filename,
        file_type=ext,
        storage_path=file_path,
        mime_type=file.content_type or "application/octet-stream",
        size_bytes=len(content),
    )

    db.add(uploaded_file)
    db.commit()
    db.refresh(uploaded_file)

    # 2) Create job
    job = Job(
        job_type=job_type,
        status="pending",
        progress_stage="created",
    )

    db.add(job)
    db.commit()
    db.refresh(job)

    # 3) Trigger processing automatically
    process_job.delay(job.id, uploaded_file.id)

    return {
        "file_id": uploaded_file.id,
        "job_id": job.id,
        "job_type": job.job_type,
        "status": "processing_started",
        "progress_stage": "queued",
    }