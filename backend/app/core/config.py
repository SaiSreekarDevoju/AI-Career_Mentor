import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "AI Autonomous Career Mentor"
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./career_mentor.db")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "supersecretkey_change_in_production_2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # default long; login overrides
    ACCESS_TOKEN_EXPIRE_MINUTES_SESSION: int = 30
    ACCESS_TOKEN_EXPIRE_MINUTES_REMEMBER: int = 60 * 24 * 7  # 7 days
    REFRESH_TOKEN_EXPIRE_DAYS_REMEMBER: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS_SESSION: int = 7
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()

