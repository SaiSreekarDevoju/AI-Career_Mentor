from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base

class InterviewSession(Base):
    __tablename__ = "interview_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    interview_type = Column(String, nullable=False) # e.g. "Backend Technical", "Behavioral"
    difficulty = Column(String, nullable=False)     # e.g. "Easy", "Medium", "Hard"
    score = Column(Float, nullable=True)            # Overall score 0-100
    transcript = Column(Text, nullable=True)
    ai_feedback = Column(Text, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    user = relationship("User", back_populates="interviews")
