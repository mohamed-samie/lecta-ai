import json

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.dependencies import get_db
from app.models.exam_attempt import ExamAttempt
from app.models.generated_exam import GeneratedExamRecord

router = APIRouter()


@router.get("/{attempt_id}")
def get_attempt(
    attempt_id: int,
    db: Session = Depends(get_db),
):
    attempt = (
        db.query(ExamAttempt)
        .filter(ExamAttempt.id == attempt_id)
        .first()
    )

    if not attempt:
        raise HTTPException(status_code=404, detail=f"Attempt id={attempt_id} not found.")

    exam_record = (
        db.query(GeneratedExamRecord)
        .filter(GeneratedExamRecord.id == attempt.generated_exam_id)
        .first()
    )

    if not exam_record:
        raise HTTPException(
            status_code=404,
            detail=f"Linked exam id={attempt.generated_exam_id} not found."
        )

    grading = json.loads(attempt.grading_json) if attempt.grading_json else {}
    feedback = json.loads(attempt.feedback_json) if attempt.feedback_json else {}

    return {
        "exam_id": exam_record.id,
        "attempt_id": attempt.id,
        "grading": grading,
        "feedback": feedback,
    }