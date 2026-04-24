from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.dependencies import get_db
from app.models.uploaded_file import UploadedFile
from app.models.parsed_document import ParsedDocument

from app.services.lecture_analysis import analyze_lecture
from app.services.exam_style_analysis import analyze_exam_style
from app.services.exam_generator import generate_exam

router = APIRouter()


@router.post("/generate")
def generate_exam_endpoint(
    session_id: int,
    db: Session = Depends(get_db),
):
    files = db.query(UploadedFile).filter(
        UploadedFile.session_id == session_id
    ).all()

    if not files:
        raise HTTPException(status_code=404, detail="No files found for this session")

    lecture_doc = None
    exam_doc = None

    for f in files:
        parsed_doc = db.query(ParsedDocument).filter(
            ParsedDocument.uploaded_file_id == f.id
        ).first()

        if not parsed_doc:
            continue

        if f.file_type == "lecture":
            lecture_doc = parsed_doc
        elif f.file_type == "previous_exam":
            exam_doc = parsed_doc

    if not lecture_doc:
        raise HTTPException(status_code=400, detail="Lecture document not found")

    if not exam_doc:
        raise HTTPException(status_code=400, detail="Previous exam document not found")

    lecture_analysis = analyze_lecture(lecture_doc.raw_text)
    exam_style = analyze_exam_style(exam_doc.raw_text)

    generated_exam = generate_exam(lecture_analysis, exam_style)

    return {
        "session_id": session_id,
        "lecture_analysis": lecture_analysis,
        "exam_style": exam_style,
        "exam": generated_exam.model_dump(),
    }