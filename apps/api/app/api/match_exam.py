import os
from uuid import uuid4

from fastapi import APIRouter, UploadFile, File, Form, Depends
from sqlalchemy.orm import Session

from app.db.dependencies import get_db
from app.models.study_session import StudySession
from app.models.uploaded_file import UploadedFile
from app.models.job import Job
from app.tasks.jobs import process_match_exam_ingestion

router = APIRouter()

UPLOAD_DIR = "uploads"


@router.post("/create")
async def create_match_exam_session(
    title: str = Form(...),
    lecture_file: UploadFile = File(...),
    previous_exam_file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    session = StudySession(
        title=title,
        session_type="match_exam",
        status="created",
    )
    db.add(session)
    db.commit()
    db.refresh(session)

    saved_files = []

    for uploaded, role in [
        (lecture_file, "lecture"),
        (previous_exam_file, "previous_exam"),
    ]:
        ext = uploaded.filename.split(".")[-1] if "." in uploaded.filename else "bin"
        unique_name = f"{uuid4()}.{ext}"
        file_path = os.path.join(UPLOAD_DIR, unique_name)

        content = await uploaded.read()
        with open(file_path, "wb") as f:
            f.write(content)

        db_file = UploadedFile(
            session_id=session.id,
            filename=uploaded.filename,
            file_type=role,
            storage_path=file_path,
            mime_type=uploaded.content_type or "application/octet-stream",
            size_bytes=len(content),
        )
        db.add(db_file)
        db.commit()
        db.refresh(db_file)
        saved_files.append(db_file)

    job = Job(
        job_type="match_exam_ingestion",
        status="pending",
        progress_stage="queued",
        session_id=session.id,
    )
    db.add(job)
    db.commit()
    db.refresh(job)

    process_match_exam_ingestion.delay(job.id, session.id)

    return {
        "session_id": session.id,
        "title": session.title,
        "job_id": job.id,
        "status": job.status,
        "progress_stage": job.progress_stage,
        "poll_url": f"/jobs/{job.id}",
        "files": [
            {
                "file_id": f.id,
                "filename": f.filename,
                "file_type": f.file_type,
            }
            for f in saved_files
        ],
    }