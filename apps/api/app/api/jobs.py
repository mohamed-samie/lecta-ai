from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.dependencies import get_db
from app.models.job import Job
from app.models.uploaded_file import UploadedFile
from app.models.parsed_document import ParsedDocument
from app.models.generated_exam import GeneratedExamRecord
from app.tasks.jobs import process_job

router = APIRouter()


def _resolve_session_status(job: Job, db: Session) -> dict:
    """
    Enrich job response for match exam flow:
    - whether lecture / previous exam were processed
    - whether an exam is already generated
    """
    result = {
        "session_id": None,
        "is_ready_for_exam_generation": False,
        "generated_exam_id": None,
        "processed_files": {
            "lecture": False,
            "previous_exam": False,
        },
    }

    if job.session_id is None:
        return result

    result["session_id"] = job.session_id

    files = db.query(UploadedFile).filter(UploadedFile.session_id == job.session_id).all()
    if not files:
        return result

    lecture_file = next((f for f in files if f.file_type == "lecture"), None)
    exam_file = next((f for f in files if f.file_type == "previous_exam"), None)

    if lecture_file:
        lecture_doc = (
            db.query(ParsedDocument)
            .filter(ParsedDocument.uploaded_file_id == lecture_file.id)
            .first()
        )
        result["processed_files"]["lecture"] = lecture_doc is not None

    if exam_file:
        exam_doc = (
            db.query(ParsedDocument)
            .filter(ParsedDocument.uploaded_file_id == exam_file.id)
            .first()
        )
        result["processed_files"]["previous_exam"] = exam_doc is not None

    result["is_ready_for_exam_generation"] = all(result["processed_files"].values())

    exam_record = (
        db.query(GeneratedExamRecord)
        .filter(GeneratedExamRecord.session_id == job.session_id)
        .order_by(GeneratedExamRecord.id.desc())
        .first()
    )
    if exam_record:
        result["generated_exam_id"] = exam_record.id

    return result


@router.post("/")
def create_job(
    job_type: str,
    db: Session = Depends(get_db),
):
    job = Job(
        job_type=job_type,
        status="pending",
        progress_stage="created",
    )

    db.add(job)
    db.commit()
    db.refresh(job)

    return {
        "job_id": job.id,
        "job_type": job.job_type,
        "status": job.status,
        "progress_stage": job.progress_stage,
    }


@router.get("/{job_id}")
def get_job(
    job_id: int,
    db: Session = Depends(get_db),
):
    job = db.query(Job).filter(Job.id == job_id).first()

    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    extra = _resolve_session_status(job, db)

    return {
        "job_id": job.id,
        "job_type": job.job_type,
        "status": job.status,
        "progress_stage": job.progress_stage,
        "error_message": job.error_message,
        "created_at": job.created_at.isoformat() if job.created_at else None,
        "session_id": extra["session_id"],
        "is_ready_for_exam_generation": extra["is_ready_for_exam_generation"],
        "generated_exam_id": extra["generated_exam_id"],
        "processed_files": extra["processed_files"],
    }


@router.post("/{job_id}/process")
def start_job_processing(
    job_id: int,
    file_id: int,
    db: Session = Depends(get_db),
):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    uploaded_file = db.query(UploadedFile).filter(UploadedFile.id == file_id).first()
    if not uploaded_file:
        raise HTTPException(status_code=404, detail="Uploaded file not found")

    process_job.delay(job_id, file_id)

    return {
        "message": "Job processing started",
        "job_id": job.id,
        "file_id": uploaded_file.id,
        "status": job.status,
    }