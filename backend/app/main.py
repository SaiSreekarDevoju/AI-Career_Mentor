from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.db.init_db import init_db
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="AI Autonomous Career Mentor API",
    description="Backend for the AI Career Mentor application",
    version="2.0.0",
)

# Initialize database on startup
@app.on_event("startup")
def on_startup():
    init_db()

from app.api.endpoints import resume, jobs, dashboard, auth, interview
app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(resume.router, prefix="/api/v1/resume", tags=["resume"])
app.include_router(jobs.router, prefix="/api/v1/jobs", tags=["jobs"])
app.include_router(dashboard.router, prefix="/api/v1/dashboard", tags=["dashboard"])
app.include_router(interview.router, prefix="/api/v1/interview", tags=["interview"])

# Configure CORS
origins = [
    "http://localhost:3000",
    "http://localhost:8000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to the AI Career Mentor API v2.0"}

@app.get("/health")
def health_check():
    return {"status": "healthy", "database": "sqlite", "version": "2.0.0"}
