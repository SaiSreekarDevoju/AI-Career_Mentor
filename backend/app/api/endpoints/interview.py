from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.agents.interview_agent import InterviewAgent
from app.api.deps import get_current_user
from app.db.database import get_db
from app.models.interview import InterviewSession
from app.models.user import User

router = APIRouter()
interview_agent = InterviewAgent()


class GenerateQuestionsIn(BaseModel):
    interview_type: str = Field(..., min_length=2)
    difficulty_level: str = Field(..., min_length=2)
    exclude_questions: list[str] = Field(default_factory=list)


@router.post("/generate-questions")
def generate_questions(
    payload: GenerateQuestionsIn,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Returns a single new interview question for the given type/difficulty.
    Client should pass exclude_questions (session) to reduce repeats; server merges recent DB history.
    """
    sessions = (
        db.query(InterviewSession)
        .filter(InterviewSession.user_id == current_user.id)
        .order_by(InterviewSession.created_at.desc())
        .limit(30)
        .all()
    )
    db_questions = [s.transcript for s in sessions if s.transcript]
    merged: list[str] = []
    seen = set()
    for q in (payload.exclude_questions or []) + db_questions:
        if not q or q in seen:
            continue
        seen.add(q)
        merged.append(q)
    merged = merged[:50]

    result = interview_agent.generate_question(
        payload.interview_type,
        payload.difficulty_level,
        merged,
    )
    return result
