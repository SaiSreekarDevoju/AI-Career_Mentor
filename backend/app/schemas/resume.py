from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ResumeBase(BaseModel):
    file_url: Optional[str] = None
    parsed_text: Optional[str] = None
    ats_score: Optional[int] = 0
    analysis_json: Optional[str] = None

class ResumeCreate(ResumeBase):
    user_id: int

class ResumeInDB(ResumeBase):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True
