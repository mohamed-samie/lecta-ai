import json
from typing import Literal

from fastapi import APIRouter, Body, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.db.dependencies import get_db
from app.models.generated_exam import GeneratedExamRecord
from app.models.exam_attempt import ExamAttempt
from app.models.uploaded_file import UploadedFile
from app.models.parsed_document import ParsedDocument
from app.models.document_chunk import DocumentChunk
from app.models.job import Job

from app.schemas.exam import GeneratedExam
from app.schemas.grading import ExamSubmission

from app.services.context_builder import build_relevant_context_for_file
from app.services.exam_style_analysis import analyze_exam_style
from app.services.lecture_analysis import analyze_lecture
from app.services.exam_generator import generate_exam
from app.services.grader import grade_mcq_exam
from app.services.feedback_engine import generate_feedback
from app.services.query_builder import build_lecture_queries
from app.services.retriever import retrieve_diverse_context
from app.services.topic_extractor import extract_topic_plan

router = APIRouter()


class ExamGenerationOptions(BaseModel):
    question_count: int = Field(default=6, gt=0)
    language: Literal["english", "arabic"] = "english"


def _get_session_files(session_id: int, db: Session):
    files = db.query(UploadedFile).filter(UploadedFile.session_id == session_id).all()
    if not files:
        raise HTTPException(status_code=404, detail="No files found for this session")

    lecture_file = next((f for f in files if f.file_type == "lecture"), None)
    exam_file = next((f for f in files if f.file_type == "previous_exam"), None)

    if not lecture_file:
        raise HTTPException(status_code=400, detail="Lecture file not found in session")
    if not exam_file:
        raise HTTPException(status_code=400, detail="Previous exam file not found in session")

    return lecture_file, exam_file


def _assert_session_ready(session_id: int, db: Session) -> None:
    job = (
        db.query(Job)
        .filter(Job.session_id == session_id)
        .order_by(Job.id.desc())
        .first()
    )

    if job is None:
        raise HTTPException(
            status_code=409,
            detail=(
                "No processing job found for this session. "
                "Call POST /match-exam/create first."
            ),
        )

    if job.status == "failed":
        raise HTTPException(
            status_code=409,
            detail=f"File processing failed: {job.error_message or 'unknown error'}. "
                   "Please re-upload your files.",
        )

    if job.status != "completed":
        raise HTTPException(
            status_code=409,
            detail=(
                f"Files are still being processed (stage: {job.progress_stage}). "
                f"Poll GET /jobs/{job.id} and wait until "
                "is_ready_for_exam_generation is true before calling /exam/generate."
            ),
        )


@router.get("/{exam_id}")
def get_exam(
    exam_id: int,
    db: Session = Depends(get_db),
):
    exam_record = (
        db.query(GeneratedExamRecord)
        .filter(GeneratedExamRecord.id == exam_id)
        .first()
    )

    if not exam_record:
        raise HTTPException(status_code=404, detail=f"Exam id={exam_id} not found.")

    generated_exam = GeneratedExam.model_validate(json.loads(exam_record.exam_json))

    return {
        "exam_id": exam_record.id,
        "session_id": exam_record.session_id,
        "topic_plan": [],
        "exam": generated_exam.model_dump(exclude_none=True),
    }


@router.post("/generate")
def generate_exam_endpoint(
    session_id: int,
    options: ExamGenerationOptions | None = Body(default=None),
    db: Session = Depends(get_db),
):
    _assert_session_ready(session_id, db)

    resolved_options = options or ExamGenerationOptions()
    question_count = resolved_options.question_count
    language = resolved_options.language

    lecture_file, exam_file = _get_session_files(session_id, db)

    lecture_doc = (
        db.query(ParsedDocument)
        .filter(ParsedDocument.uploaded_file_id == lecture_file.id)
        .order_by(ParsedDocument.id.desc())
        .first()
    )
    exam_doc = (
        db.query(ParsedDocument)
        .filter(ParsedDocument.uploaded_file_id == exam_file.id)
        .order_by(ParsedDocument.id.desc())
        .first()
    )

    if not lecture_doc:
        raise HTTPException(status_code=400, detail="Lecture parsed document not found")
    if not exam_doc:
        raise HTTPException(status_code=400, detail="Previous exam parsed document not found")

    chunk_rows = (
        db.query(DocumentChunk)
        .filter(DocumentChunk.parsed_document_id == lecture_doc.id)
        .order_by(DocumentChunk.chunk_index.asc())
        .all()
    )
    if not chunk_rows:
        raise HTTPException(status_code=400, detail="Lecture chunks are missing")

    lecture_embedded_chunks = []
    lecture_all_chunk_texts = []

    for row in chunk_rows:
        lecture_all_chunk_texts.append(row.chunk_text)
        try:
            embedding = json.loads(row.embedding_json)
            lecture_embedded_chunks.append(
                {"text": row.chunk_text, "embedding": embedding}
            )
        except Exception:
            continue

    if not lecture_embedded_chunks:
        raise HTTPException(status_code=400, detail="Lecture embeddings could not be loaded")

    lecture_summary = analyze_lecture(lecture_doc.raw_text[:4000])
    exam_style = analyze_exam_style(exam_doc.raw_text[:5000])

    exam_context_chunks = build_relevant_context_for_file(
        db=db,
        uploaded_file_id=exam_file.id,
        query="question style difficulty structure tone format professor phrasing",
        k=3,
    )

    topic_plan = extract_topic_plan(
        lecture_summary=lecture_summary,
        lecture_context_chunks=lecture_all_chunk_texts[:60],
        max_topics=max(6, min(question_count, 12)),
    )

    lecture_queries = build_lecture_queries(
        lecture_summary=lecture_summary,
        exam_style=exam_style,
        exam_context_chunks=exam_context_chunks,
        topic_plan=topic_plan,
    )

    lecture_context_chunks = retrieve_diverse_context(
        queries=lecture_queries,
        embedded_chunks=lecture_embedded_chunks,
        k_per_query=2,
        max_total=8,
    )

    if not lecture_context_chunks:
        lecture_context_chunks = lecture_all_chunk_texts[:8]

    generated_exam = generate_exam(
        lecture_context_chunks=lecture_context_chunks,
        exam_context_chunks=exam_context_chunks,
        exam_style=exam_style,
        topic_plan=topic_plan,
        question_count=question_count,
        language=language,
    )

    exam_record = GeneratedExamRecord(
        session_id=session_id,
        exam_json=json.dumps(generated_exam.model_dump()),
        question_count=len(generated_exam.questions),
    )
    db.add(exam_record)
    db.commit()
    db.refresh(exam_record)

    return {
        "exam_id": exam_record.id,
        "session_id": session_id,
        "topic_plan": topic_plan,
        "exam": generated_exam.model_dump(exclude_none=True),
    }


@router.post("/submit")
def submit_exam(
    submission: ExamSubmission,
    db: Session = Depends(get_db),
):
    if submission.exam_id is None:
        raise HTTPException(
            status_code=400,
            detail="exam_id is required. Call /exam/generate first.",
        )

    exam_record = (
        db.query(GeneratedExamRecord)
        .filter(GeneratedExamRecord.id == submission.exam_id)
        .first()
    )
    if not exam_record:
        raise HTTPException(
            status_code=404,
            detail=f"Exam id={submission.exam_id} not found.",
        )

    generated_exam = GeneratedExam.model_validate(json.loads(exam_record.exam_json))

    grading_result = grade_mcq_exam(exam=generated_exam, submission=submission)
    feedback = generate_feedback(grading_result)

    attempt = ExamAttempt(
        generated_exam_id=exam_record.id,
        submission_json=json.dumps([a.model_dump() for a in submission.answers]),
        grading_json=json.dumps(grading_result.model_dump()),
        feedback_json=json.dumps(feedback),
        score=grading_result.total_score,
        accuracy=grading_result.accuracy,
    )
    db.add(attempt)
    db.commit()
    db.refresh(attempt)

    return {
        "exam_id": exam_record.id,
        "attempt_id": attempt.id,
        "grading": grading_result.model_dump(),
        "feedback": feedback,
    }