from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.api import deps
from app.models.user import User
from app.models.resume import Candidate, Resume, CandidateSkill
from sqlalchemy import func

router = APIRouter()

@router.get("/dashboard")
def get_dashboard_metrics(
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    candidate_query = db.query(Candidate).join(Resume, Candidate.resume_id == Resume.id)
    resume_query = db.query(Resume).filter(Resume.status == "completed")
    skill_query = db.query(CandidateSkill.name, func.count(CandidateSkill.id)).join(
        Candidate, CandidateSkill.candidate_id == Candidate.id
    ).join(Resume, Candidate.resume_id == Resume.id)

    if not current_user.role or current_user.role.name != "Admin":
        candidate_query = candidate_query.filter(Resume.uploader_id == current_user.id)
        resume_query = resume_query.filter(Resume.uploader_id == current_user.id)
        skill_query = skill_query.filter(Resume.uploader_id == current_user.id)

    total_candidates = candidate_query.count()
    average_score = candidate_query.with_entities(func.avg(Candidate.match_score)).scalar()
    top_skills = [
        {"name": name, "count": count}
        for name, count in skill_query.group_by(CandidateSkill.name)
        .order_by(func.count(CandidateSkill.id).desc(), CandidateSkill.name.asc())
        .limit(8)
        .all()
    ]
    return {
        "total_candidates": total_candidates,
        "resumes_parsed": resume_query.count(),
        "avg_match_score": round(float(average_score), 2) if average_score is not None else None,
        "processing_time_avg": None,
        "top_skills": top_skills,
    }
