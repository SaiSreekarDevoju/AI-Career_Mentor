from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    first_name = Column(String, index=True)
    last_name = Column(String, index=True)
    avatar_url = Column(String, nullable=True)
    current_title = Column(String, nullable=True)
    target_role = Column(String, nullable=True)
    
    is_active = Column(Boolean, default=True)
    is_trial_user = Column(Boolean, default=False)
    trial_start_date = Column(DateTime(timezone=True), nullable=True)
    trial_end_date = Column(DateTime(timezone=True), nullable=True)
    subscription_type = Column(String, default="free")
    theme = Column(String(16), default="dark")  # "dark" | "light"

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    resumes = relationship("Resume", back_populates="owner")
    interviews = relationship("InterviewSession", back_populates="user")
    roadmaps = relationship("Roadmap", back_populates="user")
    notifications = relationship("Notification", back_populates="user")
    refresh_tokens = relationship(
        "RefreshToken", back_populates="user", cascade="all, delete-orphan"
    )
    user_jobs = relationship("UserJob", back_populates="user", cascade="all, delete-orphan")
