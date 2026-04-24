import json

from app.core.celery_app import celery_app
from app.db.session import SessionLocal

from app.models.job import Job
from app.models.uploaded_file import UploadedFile
from app.models.parsed_document import ParsedDocument
from app.models.document_chunk import DocumentChunk

from app.services.parser import extract_text_from_pdf
from app.services.chunker import chunk_text
from app.services.embedder import embed_chunks
from app.models.study_session import StudySession  # noqa: F401

@celery_app.task(name="app.tasks.jobs.process_job")
def process_job(job_id: int, file_id: int):
    db = SessionLocal()

    try:
        job = db.query(Job).filter(Job.id == job_id).first()
        if not job:
            return {"error": "Job not found"}

        uploaded_file = db.query(UploadedFile).filter(UploadedFile.id == file_id).first()
        if not uploaded_file:
            job.status = "failed"
            job.progress_stage = "failed"
            job.error_message = f"Uploaded file with id={file_id} not found"
            db.commit()
            return {"error": "Uploaded file not found"}

        job.status = "processing"
        job.progress_stage = "parsing"
        db.commit()

        text = extract_text_from_pdf(uploaded_file.storage_path)

        parsed_doc = ParsedDocument(
            uploaded_file_id=uploaded_file.id,
            raw_text=text,
        )
        db.add(parsed_doc)
        db.commit()
        db.refresh(parsed_doc)

        job.progress_stage = "chunking"
        db.commit()

        chunks = chunk_text(text)

        job.progress_stage = "embedding"
        db.commit()

        embedded_chunks = embed_chunks(chunks)

        for i, item in enumerate(embedded_chunks):
            chunk = DocumentChunk(
                parsed_document_id=parsed_doc.id,
                chunk_index=i,
                chunk_text=item["text"],
                embedding_json=json.dumps(item["embedding"]),
            )
            db.add(chunk)

        db.commit()

        job.status = "completed"
        job.progress_stage = "finished"
        db.commit()

        return {
            "job_id": job.id,
            "file_id": uploaded_file.id,
            "parsed_document_id": parsed_doc.id,
            "chunks_count": len(embedded_chunks),
            "status": job.status,
            "progress_stage": job.progress_stage,
        }

    except Exception as e:
        job = db.query(Job).filter(Job.id == job_id).first()
        if job:
            job.status = "failed"
            job.progress_stage = "failed"
            job.error_message = str(e)
            db.commit()
        raise

    finally:
        db.close()


@celery_app.task(name="app.tasks.jobs.process_match_exam_ingestion")
def process_match_exam_ingestion(job_id: int, session_id: int):
    db = SessionLocal()

    try:
        job = db.query(Job).filter(Job.id == job_id).first()
        if not job:
            return {"error": "Job not found"}

        session_files = (
            db.query(UploadedFile)
            .filter(UploadedFile.session_id == session_id)
            .order_by(UploadedFile.id.asc())
            .all()
        )

        if not session_files:
            job.status = "failed"
            job.progress_stage = "failed"
            job.error_message = f"No files found for session_id={session_id}"
            db.commit()
            return {"error": "No files found for session"}

        job.status = "processing"
        job.progress_stage = "parsing"
        db.commit()

        processed_files = []

        for uploaded_file in session_files:
            text = extract_text_from_pdf(uploaded_file.storage_path)

            parsed_doc = ParsedDocument(
                uploaded_file_id=uploaded_file.id,
                raw_text=text,
            )
            db.add(parsed_doc)
            db.commit()
            db.refresh(parsed_doc)

            job.progress_stage = f"chunking_{uploaded_file.file_type}"
            db.commit()

            chunks = chunk_text(text)

            job.progress_stage = f"embedding_{uploaded_file.file_type}"
            db.commit()

            embedded_chunks = embed_chunks(chunks)

            for i, item in enumerate(embedded_chunks):
                chunk = DocumentChunk(
                    parsed_document_id=parsed_doc.id,
                    chunk_index=i,
                    chunk_text=item["text"],
                    embedding_json=json.dumps(item["embedding"]),
                )
                db.add(chunk)

            db.commit()

            processed_files.append(
                {
                    "file_id": uploaded_file.id,
                    "file_type": uploaded_file.file_type,
                    "parsed_document_id": parsed_doc.id,
                    "chunks_count": len(embedded_chunks),
                }
            )

        job.status = "completed"
        job.progress_stage = "ready_for_exam_generation"
        db.commit()

        return {
            "job_id": job.id,
            "session_id": session_id,
            "processed_files": processed_files,
            "status": job.status,
            "progress_stage": job.progress_stage,
        }

    except Exception as e:
        job = db.query(Job).filter(Job.id == job_id).first()
        if job:
            job.status = "failed"
            job.progress_stage = "failed"
            job.error_message = str(e)
            db.commit()
        raise

    finally:
        db.close()