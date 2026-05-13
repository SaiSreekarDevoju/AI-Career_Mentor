import json
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func as sql_func
from sqlalchemy.orm import Session

from app.agents.interview_agent import InterviewAgent
from app.agents.roadmap_agent import RoadmapAgent
from app.agents.skill_agent import SkillGapAgent
from app.api.deps import get_current_user
from app.db.database import get_db
from app.models.interview import InterviewSession
from app.models.job import JobListing, UserJob
from app.models.notification import Notification
from app.models.resume import Resume
from app.models.roadmap import Roadmap
from app.models.user import User

router = APIRouter()
roadmap_agent = RoadmapAgent()
skill_agent = SkillGapAgent()
interview_agent = InterviewAgent()


def _latest_resume(db: Session, user_id: int) -> Resume | None:
    return (
        db.query(Resume)
        .filter(Resume.user_id == user_id)
        .order_by(Resume.created_at.desc())
        .first()
    )


def _roadmap_progress(weeks_data: dict) -> tuple[int, int]:
    weeks = weeks_data.get("weeks") or []
    total = 0
    done = 0
    for w in weeks:
        for t in w.get("tasks") or []:
            total += 1
            if t.get("done"):
                done += 1
    daily = weeks_data.get("daily_tasks") or []
    for t in daily:
        total += 1
        if t.get("done"):
            done += 1
    return done, total


@router.get("/trial")
def trial_status(current_user: User = Depends(get_current_user)):
    return {
        "server_time": datetime.now(timezone.utc).isoformat(),
        "trial_end_date": current_user.trial_end_date.isoformat()
        if current_user.trial_end_date
        else None,
        "is_trial_user": bool(current_user.is_trial_user),
    }


@router.get("/overview")
def get_overview(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    total_interviews = (
        db.query(InterviewSession)
        .filter(InterviewSession.user_id == current_user.id)
        .count()
    )
    avg_score = (
        db.query(sql_func.avg(InterviewSession.score))
        .filter(InterviewSession.user_id == current_user.id)
        .scalar()
        or 0
    )

    latest = _latest_resume(db, current_user.id)
    ats_score = int(latest.ats_score) if latest and latest.ats_score else 0

    jobs_matched = db.query(JobListing).count()
    saved_cnt = (
        db.query(UserJob)
        .filter(
            UserJob.user_id == current_user.id,
            UserJob.saved_at.isnot(None),
        )
        .count()
    )

    roadmap = (
        db.query(Roadmap)
        .filter(Roadmap.user_id == current_user.id)
        .order_by(Roadmap.created_at.desc())
        .first()
    )
    skills_learned = 0
    goals_out = []
    if roadmap and roadmap.weeks_data:
        done, total = _roadmap_progress(roadmap.weeks_data)
        skills_learned = min(25, done * 2)
        goals = roadmap.weeks_data.get("goals") or []
        goals_out = [
            {
                "title": g.get("title", "Goal"),
                "progress": int(g.get("progress", 0)),
                "color": "bg-primary" if i % 2 == 0 else "bg-accent",
            }
            for i, g in enumerate(goals[:4])
        ]

    interview_readiness = int(round(float(avg_score))) if avg_score else 0
    if interview_readiness == 0:
        interview_readiness = min(95, ats_score if ats_score else 45)

    recs = []
    if ats_score < 70:
        recs.append(
            {
                "title": "Boost ATS alignment",
                "desc": "Your latest resume score suggests adding role-specific keywords and measurable outcomes.",
                "time": "15 mins",
                "link": "/dashboard/resume",
            }
        )
    else:
        recs.append(
            {
                "title": "Keep resume fresh",
                "desc": "Update projects quarterly to reflect your strongest recent work.",
                "time": "10 mins",
                "link": "/dashboard/resume",
            }
        )
    recs.append(
        {
            "title": "Run a mock interview",
            "desc": "Practice a timed answer with speech-to-text feedback.",
            "time": "25 mins",
            "link": "/dashboard/interviews",
        }
    )
    recs.append(
        {
            "title": "Review skill gaps",
            "desc": "Compare your stack against your target role and close top gaps first.",
            "time": "20 mins",
            "link": "/dashboard/skills",
        }
    )

    if not goals_out:
        goals_out = [
            {"title": "Interview readiness", "progress": interview_readiness, "color": "bg-primary"},
            {"title": "Resume strength", "progress": min(100, ats_score), "color": "bg-accent"},
        ]

    return {
        "ats_score": ats_score,
        "jobs_matched": jobs_matched,
        "saved_jobs": saved_cnt,
        "skills_learned": skills_learned,
        "interview_readiness": interview_readiness,
        "total_interviews": total_interviews,
        "recommended_actions": recs,
        "goals": goals_out,
    }


@router.post("/skills/gap")
def analyze_skill_gap(payload: dict, current_user: User = Depends(get_current_user)):
    user_skills = payload.get("user_skills", ["HTML", "CSS", "React"])
    target_role = payload.get(
        "target_role", current_user.target_role or "Senior Frontend Engineer"
    )
    return skill_agent.analyze_gap(user_skills, target_role)


@router.post("/roadmap/generate")
def generate_roadmap(payload: dict, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    target_role = payload.get(
        "target_role", current_user.target_role or "Senior Frontend Engineer"
    )
    missing_skills = payload.get("missing_skills", ["System Design", "GraphQL", "AWS"])
    data = roadmap_agent.generate_roadmap_extended(target_role, missing_skills)
    row = Roadmap(user_id=current_user.id, target_role=target_role, weeks_data=data)
    db.add(row)
    db.commit()
    db.refresh(row)
    return {"id": row.id, **data}


@router.get("/roadmap/current")
def get_current_roadmap(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    row = (
        db.query(Roadmap)
        .filter(Roadmap.user_id == current_user.id)
        .order_by(Roadmap.created_at.desc())
        .first()
    )
    if not row:
        return {"id": None, "weeks": [], "goals": [], "daily_tasks": [], "milestones": []}
    data = row.weeks_data or {}
    return {"id": row.id, "target_role": row.target_role, **data}


@router.put("/roadmap/{roadmap_id}")
def update_roadmap_progress(
    roadmap_id: int,
    payload: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    row = (
        db.query(Roadmap)
        .filter(Roadmap.id == roadmap_id, Roadmap.user_id == current_user.id)
        .first()
    )
    if not row:
        raise HTTPException(status_code=404, detail="Roadmap not found")
    incoming = payload.get("weeks_data")
    if not isinstance(incoming, dict):
        raise HTTPException(status_code=400, detail="weeks_data must be an object")
    row.weeks_data = incoming
    db.commit()
    return {"status": "ok"}


@router.post("/interviews/question")
def get_interview_question(
    payload: dict, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    interview_type = payload.get("type", "Behavioral & Culture Fit")
    difficulty = payload.get("difficulty", "Medium")

    past_sessions = (
        db.query(InterviewSession)
        .filter(InterviewSession.user_id == current_user.id)
        .order_by(InterviewSession.created_at.desc())
        .limit(40)
        .all()
    )
    past_questions = [s.transcript for s in past_sessions if s.transcript]

    return interview_agent.generate_question(interview_type, difficulty, past_questions)


@router.post("/interviews/evaluate")
def evaluate_interview_answer(
    payload: dict, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    question = payload.get("question", "")
    user_answer = payload.get("user_answer", "")
    ideal_points = payload.get("ideal_points", [])
    interview_type = payload.get("interview_type", "Behavioral")
    difficulty = payload.get("difficulty", "Medium")

    result = interview_agent.evaluate_answer(question, user_answer, ideal_points)

    session = InterviewSession(
        user_id=current_user.id,
        interview_type=interview_type,
        difficulty=difficulty,
        score=result.get("score", 0),
        transcript=question,
        ai_feedback=result.get("feedback", ""),
    )
    db.add(session)
    db.commit()

    return result


@router.get("/interviews/history")
def get_interview_history(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    sessions = (
        db.query(InterviewSession)
        .filter(InterviewSession.user_id == current_user.id)
        .order_by(InterviewSession.created_at.desc())
        .limit(20)
        .all()
    )
    return {
        "sessions": [
            {
                "id": s.id,
                "type": s.interview_type,
                "difficulty": s.difficulty,
                "score": s.score,
                "feedback": s.ai_feedback,
                "created_at": s.created_at.isoformat() if s.created_at else None,
            }
            for s in sessions
        ]
    }


@router.get("/notifications")
def get_notifications(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    notifs = (
        db.query(Notification)
        .filter(Notification.user_id == current_user.id)
        .order_by(Notification.created_at.desc())
        .limit(20)
        .all()
    )
    return {
        "notifications": [
            {
                "id": n.id,
                "title": n.title,
                "message": n.message,
                "is_read": n.is_read,
                "type": n.type,
                "created_at": n.created_at.isoformat() if n.created_at else None,
            }
            for n in notifs
        ]
    }


@router.put("/notifications/{notification_id}/read")
def mark_notification_read(
    notification_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    notif = (
        db.query(Notification)
        .filter(
            Notification.id == notification_id, Notification.user_id == current_user.id
        )
        .first()
    )
    if notif:
        notif.is_read = True
        db.commit()
    return {"status": "ok"}
