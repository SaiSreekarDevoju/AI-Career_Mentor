from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy import and_, or_
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.database import get_db
from app.models.job import JobListing, UserJob
from app.models.resume import Resume
from app.models.user import User

router = APIRouter()


class JobOut(BaseModel):
    id: int
    title: str
    company: str
    description: str
    location_type: str
    job_type: str
    salary_min_inr: int | None
    salary_max_inr: int | None
    experience_level: str
    skills: str
    company_type: str
    apply_url: str
    match: int
    saved: bool
    applied: bool

    class Config:
        from_attributes = True


def _match_score(job: JobListing, resume_blob: str, target_role: str) -> int:
    text = f"{job.title} {job.description} {job.skills}".lower()
    blob = (resume_blob or "").lower()
    role = (target_role or "").lower()
    score = 55
    hits = sum(1 for tok in job.skills.split(",") if tok.strip().lower() in blob)
    score += min(25, hits * 4)
    if role and any(w in text for w in role.split() if len(w) > 3):
        score += 10
    return max(40, min(99, score))


@router.get("/recommendations")
def get_job_recommendations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    location_type: str | None = Query(None),
    job_type: str | None = Query(None),
    salary_min_inr: int | None = Query(None),
    salary_max_inr: int | None = Query(None),
    experience_level: str | None = Query(None),
    skills: str | None = Query(None),
    company_type: str | None = Query(None),
    q: str | None = Query(None, description="Search title/company/description"),
):
    latest_resume = (
        db.query(Resume)
        .filter(Resume.user_id == current_user.id)
        .order_by(Resume.created_at.desc())
        .first()
    )
    resume_blob = (latest_resume.parsed_text or "") if latest_resume else ""
    target_role = current_user.target_role or ""

    query = db.query(JobListing)
    if location_type and location_type != "Any":
        query = query.filter(JobListing.location_type == location_type)
    if job_type and job_type != "Any":
        query = query.filter(JobListing.job_type == job_type)
    if company_type and company_type != "Any":
        query = query.filter(JobListing.company_type == company_type)
    if experience_level and experience_level != "Any":
        query = query.filter(JobListing.experience_level == experience_level)
    if salary_min_inr is not None:
        query = query.filter(
            or_(
                JobListing.salary_max_inr.is_(None),
                JobListing.salary_max_inr >= salary_min_inr,
            )
        )
    if salary_max_inr is not None:
        query = query.filter(
            or_(
                JobListing.salary_min_inr.is_(None),
                JobListing.salary_min_inr <= salary_max_inr,
            )
        )
    if skills:
        for part in skills.split(","):
            token = part.strip()
            if token:
                query = query.filter(JobListing.skills.ilike(f"%{token}%"))
    if q:
        like = f"%{q}%"
        query = query.filter(
            or_(
                JobListing.title.ilike(like),
                JobListing.company.ilike(like),
                JobListing.description.ilike(like),
            )
        )

    jobs = query.order_by(JobListing.id.desc()).all()

    links = {
        uj.job_id: uj
        for uj in db.query(UserJob).filter(UserJob.user_id == current_user.id).all()
    }

    out = []
    for job in jobs:
        uj = links.get(job.id)
        out.append(
            {
                "id": job.id,
                "title": job.title,
                "company": job.company,
                "description": job.description,
                "location_type": job.location_type,
                "job_type": job.job_type,
                "salary_min_inr": job.salary_min_inr,
                "salary_max_inr": job.salary_max_inr,
                "experience_level": job.experience_level,
                "skills": job.skills,
                "company_type": job.company_type,
                "apply_url": job.apply_url,
                "match": _match_score(job, resume_blob, target_role),
                "saved": bool(uj and uj.saved_at),
                "applied": bool(uj and uj.applied_at),
            }
        )
    out.sort(key=lambda x: x["match"], reverse=True)
    return {"status": "success", "jobs": out}


@router.post("/{job_id}/save")
def save_job(job_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    job = db.query(JobListing).filter(JobListing.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    uj = (
        db.query(UserJob)
        .filter(and_(UserJob.user_id == current_user.id, UserJob.job_id == job_id))
        .first()
    )
    now = datetime.now(timezone.utc)
    if not uj:
        uj = UserJob(user_id=current_user.id, job_id=job_id, saved_at=now)
        db.add(uj)
    else:
        uj.saved_at = now if not uj.saved_at else None  # toggle
    db.commit()
    return {"status": "ok", "saved": bool(uj.saved_at)}


@router.post("/{job_id}/apply")
def apply_job(job_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    job = db.query(JobListing).filter(JobListing.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    uj = (
        db.query(UserJob)
        .filter(and_(UserJob.user_id == current_user.id, UserJob.job_id == job_id))
        .first()
    )
    now = datetime.now(timezone.utc)
    if not uj:
        uj = UserJob(user_id=current_user.id, job_id=job_id, applied_at=now)
        db.add(uj)
    else:
        uj.applied_at = now
    db.commit()
    return {"status": "ok", "apply_url": job.apply_url}


@router.get("/my-list")
def my_jobs(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    rows = (
        db.query(UserJob, JobListing)
        .join(JobListing, UserJob.job_id == JobListing.id)
        .filter(UserJob.user_id == current_user.id)
        .all()
    )
    saved = []
    applied = []
    for uj, job in rows:
        base = {
            "id": job.id,
            "title": job.title,
            "company": job.company,
            "apply_url": job.apply_url,
            "salary_min_inr": job.salary_min_inr,
            "salary_max_inr": job.salary_max_inr,
            "location_type": job.location_type,
            "job_type": job.job_type,
        }
        if uj.saved_at:
            saved.append({**base, "saved_at": uj.saved_at.isoformat()})
        if uj.applied_at:
            applied.append({**base, "applied_at": uj.applied_at.isoformat()})
    return {"saved": saved, "applied": applied}
