from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.api import deps
from app.models.user import User
from app.models.resume import Candidate, Resume, CandidateSkill

router = APIRouter()

@router.get("/dashboard")
def get_dashboard_metrics(
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    total_candidates = db.query(Candidate).count()
    resumes_parsed = db.query(Resume).filter(Resume.status == "completed").count()
    
    # Mock some data for the MVP dashboard
    return {
        "total_candidates": total_candidates,
        "resumes_parsed": resumes_parsed,
        "avg_match_score": 84,
        "processing_time_avg": 1.2,
        "top_skills": [
            {"name": "Python", "count": 120},
            {"name": "React", "count": 95},
            {"name": "Docker", "count": 80}
        ]
    }
