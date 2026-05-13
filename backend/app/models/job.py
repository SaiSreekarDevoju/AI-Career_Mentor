from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.database import Base


class JobListing(Base):
    __tablename__ = "job_listings"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    company = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    location_type = Column(String(32), nullable=False)  # Remote, On-site, Hybrid
    job_type = Column(String(32), nullable=False)  # Internship, Full-time
    salary_min_inr = Column(Integer, nullable=True)
    salary_max_inr = Column(Integer, nullable=True)
    experience_level = Column(String(64), nullable=False)  # e.g. 0-2 years
    skills = Column(String(512), nullable=False)  # comma-separated
    company_type = Column(String(64), nullable=False)  # Startup, Enterprise, etc.
    apply_url = Column(String(1024), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user_links = relationship("UserJob", back_populates="job")


class UserJob(Base):
    __tablename__ = "user_jobs"
    __table_args__ = (UniqueConstraint("user_id", "job_id", name="uq_user_job"),)

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    job_id = Column(Integer, ForeignKey("job_listings.id"), nullable=False, index=True)
    saved_at = Column(DateTime(timezone=True), nullable=True)
    applied_at = Column(DateTime(timezone=True), nullable=True)

    user = relationship("User", back_populates="user_jobs")
    job = relationship("JobListing", back_populates="user_links")
