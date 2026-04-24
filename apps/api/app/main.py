from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.files import router as files_router
from app.api.jobs import router as jobs_router
from app.api.pipeline import router as pipeline_router
from app.api.search import router as search_router
from app.api.match_exam import router as match_exam_router
from app.api.exam import router as exam_router
from app.api import attempt



app = FastAPI(title="Lecta AI API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(files_router, prefix="/files", tags=["files"])
app.include_router(jobs_router, prefix="/jobs", tags=["jobs"])
app.include_router(pipeline_router, prefix="/pipeline", tags=["pipeline"])
app.include_router(search_router, prefix="/search", tags=["search"])
app.include_router(match_exam_router, prefix="/match-exam", tags=["match-exam"])
app.include_router(exam_router, prefix="/exam", tags=["exam"])
app.include_router(attempt.router, prefix="/attempt", tags=["attempt"])



@app.get("/health")
def health():
    return {"status": "ok"}