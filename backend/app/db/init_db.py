from sqlalchemy import text

from app.core.config import settings
from app.db.database import Base, engine, SessionLocal
from app.models.user import User
from app.models.notification import Notification
from app.models.job import JobListing, UserJob
from app.models.resume import Resume
from app.models.interview import InterviewSession
from app.models.roadmap import Roadmap
from app.core.security import get_password_hash



def _ensure_sqlite_columns():
    if not str(settings.DATABASE_URL).startswith("sqlite"):
        return
    with engine.connect() as conn:
        rows = conn.execute(text("PRAGMA table_info(users)")).fetchall()
        names = {r[1] for r in rows}
        if "theme" not in names:
            conn.execute(text("ALTER TABLE users ADD COLUMN theme VARCHAR(16) DEFAULT 'dark'"))
            conn.commit()

        rt = conn.execute(text("PRAGMA table_info(refresh_tokens)")).fetchall()
        if rt:
            rt_names = {r[1] for r in rt}
            if "long_lived" not in rt_names:
                conn.execute(
                    text("ALTER TABLE refresh_tokens ADD COLUMN long_lived BOOLEAN DEFAULT 1")
                )
                conn.commit()


def _seed_jobs(db):
    if db.query(JobListing).first():
        return
    jobs = [
        JobListing(
            title="Frontend Engineer",
            company="Razorpay",
            description="Build payments dashboards with React and TypeScript.",
            location_type="Hybrid",
            job_type="Full-time",
            salary_min_inr=1800000,
            salary_max_inr=2800000,
            experience_level="2-4 years",
            skills="React,TypeScript,Next.js,CSS",
            company_type="Enterprise",
            apply_url="https://razorpay.com/careers",
        ),
        JobListing(
            title="Backend Intern",
            company="CRED",
            description="Internship on microservices and Kotlin/Java services.",
            location_type="On-site",
            job_type="Internship",
            salary_min_inr=500000,
            salary_max_inr=900000,
            experience_level="0-1 years",
            skills="Java,Kotlin,Spring,REST",
            company_type="Startup",
            apply_url="https://cred.club/careers",
        ),
        JobListing(
            title="Full Stack Developer",
            company="Zoho",
            description="End-to-end product features with JS stack and internal frameworks.",
            location_type="On-site",
            job_type="Full-time",
            salary_min_inr=1200000,
            salary_max_inr=2200000,
            experience_level="1-3 years",
            skills="JavaScript,Python,SQL,React",
            company_type="Enterprise",
            apply_url="https://www.zoho.com/careers.html",
        ),
        JobListing(
            title="ML Engineer",
            company="Sarvam AI",
            description="LLM inference, evaluation, and data pipelines.",
            location_type="Remote",
            job_type="Full-time",
            salary_min_inr=2500000,
            salary_max_inr=4500000,
            experience_level="3-6 years",
            skills="Python,PyTorch,LLM,RAG",
            company_type="Startup",
            apply_url="https://www.sarvam.ai/careers",
        ),
        JobListing(
            title="DevOps Engineer",
            company="Flipkart",
            description="Kubernetes, CI/CD, observability for high-scale retail.",
            location_type="Hybrid",
            job_type="Full-time",
            salary_min_inr=2000000,
            salary_max_inr=3600000,
            experience_level="2-5 years",
            skills="Kubernetes,Docker,AWS,CI/CD",
            company_type="Enterprise",
            apply_url="https://www.flipkartcareers.com/",
        ),
        JobListing(
            title="Security Analyst",
            company="Seqrite",
            description="Threat modeling, secure SDLC, and incident response.",
            location_type="Remote",
            job_type="Full-time",
            salary_min_inr=1400000,
            salary_max_inr=2600000,
            experience_level="1-4 years",
            skills="Security,Networking,Python,SIEM",
            company_type="Enterprise",
            apply_url="https://www.seqrite.com/careers",
        ),
        JobListing(
            title="Mobile Developer",
            company="PhonePe",
            description="Android/Kotlin features for UPI super-app.",
            location_type="Hybrid",
            job_type="Full-time",
            salary_min_inr=2200000,
            salary_max_inr=4000000,
            experience_level="2-5 years",
            skills="Kotlin,Android,Jetpack Compose",
            company_type="Enterprise",
            apply_url="https://www.phonepe.com/careers",
        ),
        JobListing(
            title="Data Engineer Intern",
            company="Swiggy",
            description="Batch/stream pipelines on Spark and Airflow.",
            location_type="On-site",
            job_type="Internship",
            salary_min_inr=600000,
            salary_max_inr=1000000,
            experience_level="0-1 years",
            skills="Python,SQL,Spark,Airflow",
            company_type="Startup",
            apply_url="https://careers.swiggy.com/",
        ),
        JobListing(
            title="Cloud Architect",
            company="AWS India",
            description="Customer architecture on AWS with Well-Architected reviews.",
            location_type="Remote",
            job_type="Full-time",
            salary_min_inr=3500000,
            salary_max_inr=6500000,
            experience_level="6+ years",
            skills="AWS,Terraform,System Design",
            company_type="Enterprise",
            apply_url="https://www.amazon.jobs/en/teams/aws",
        ),
        JobListing(
            title="Database Reliability Engineer",
            company="Atlassian India",
            description="Postgres/MySQL reliability, backups, and performance.",
            location_type="Remote",
            job_type="Full-time",
            salary_min_inr=2400000,
            salary_max_inr=4200000,
            experience_level="3-6 years",
            skills="PostgreSQL,MySQL,Linux,Python",
            company_type="Enterprise",
            apply_url="https://www.atlassian.com/company/careers",
        ),
        JobListing(
            title="Frontend Intern",
            company="Groww",
            description="UI experiments and design system contributions.",
            location_type="Remote",
            job_type="Internship",
            salary_min_inr=700000,
            salary_max_inr=1100000,
            experience_level="0-1 years",
            skills="React,JavaScript,HTML,CSS",
            company_type="Startup",
            apply_url="https://groww.in/careers",
        ),
        JobListing(
            title="Backend Engineer",
            company="Postman",
            description="API platform services in Node/Go.",
            location_type="Remote",
            job_type="Full-time",
            salary_min_inr=2600000,
            salary_max_inr=4800000,
            experience_level="3-6 years",
            skills="Node.js,Go,PostgreSQL,REST",
            company_type="Startup",
            apply_url="https://www.postman.com/company/careers/",
        ),
        JobListing(
            title="Systems Engineer",
            company="NVIDIA India",
            description="Low-level performance, drivers adjacent work.",
            location_type="Hybrid",
            job_type="Full-time",
            salary_min_inr=2800000,
            salary_max_inr=5200000,
            experience_level="2-5 years",
            skills="C++,CUDA,Operating Systems",
            company_type="Enterprise",
            apply_url="https://www.nvidia.com/en-us/about-nvidia/careers/",
        ),
    ]
    for j in jobs:
        db.add(j)
    db.commit()
    print(f"Seeded {len(jobs)} job listings.")


def init_db():
    print("Creating all tables...")
    Base.metadata.create_all(bind=engine)
    _ensure_sqlite_columns()

    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == "sreekardevoju@gmail.com").first()
        if not user:
            user = User(
                email="sreekardevoju@gmail.com",
                hashed_password=get_password_hash("password123"),
                first_name="Sreekar",
                last_name="Devoju",
                current_title="AI Engineer",
                target_role="Senior AI Engineer",
                is_trial_user=True,
            )
            from datetime import datetime, timedelta, timezone

            user.trial_start_date = datetime.now(timezone.utc)
            user.trial_end_date = datetime.now(timezone.utc) + timedelta(days=3)
            user.subscription_type = "trial"
            db.add(user)
            db.commit()
            db.refresh(user)

            notif = Notification(
                user_id=user.id,
                title="Welcome to Mentoria.ai!",
                message="Your AI career mentor is ready. Start by uploading your resume.",
                type="success",
            )
            db.add(notif)
            db.commit()
            print("Seeded user: Sreekar Devoju (sreekardevoju@gmail.com)")
        else:
            print("User already exists.")

        _seed_jobs(db)
    finally:
        db.close()
    print("Database initialization complete.")


if __name__ == "__main__":
    init_db()
