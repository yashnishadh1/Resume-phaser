from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class ResumeBase(BaseModel):
    filename: str
    status: str
    mime_type: Optional[str] = None
    file_size: Optional[int] = None

class ResumeResponse(ResumeBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class CandidateSkillSchema(BaseModel):
    name: str
    type: Optional[str] = None
    
    class Config:
        from_attributes = True

class CandidateBase(BaseModel):
    full_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    summary: Optional[str] = None

class CandidateResponse(CandidateBase):
    id: int
    resume_id: int
    experience_years: int = 0
    match_score: float = 0.0
    applied_role: Optional[str] = None
    status: Optional[str] = "Pending"
    skills: list[CandidateSkillSchema] = []
    created_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True
