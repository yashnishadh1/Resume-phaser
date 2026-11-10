from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import or_
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.api import deps
from app.models.user import User
from app.models.resume import Candidate, Resume
from app.schemas.resume import CandidateResponse

router = APIRouter()

@router.get("", response_model=list[CandidateResponse])
def get_candidates(
    db: Session = Depends(get_db),
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=1000),
    search: str | None = Query(default=None, min_length=1, max_length=200),
    current_user: User = Depends(deps.get_current_active_user)
):
    query = db.query(Candidate)
    
    if not current_user.role or current_user.role.name != "Admin":
        query = query.join(Resume).filter(Resume.uploader_id == current_user.id)
    
    if search:
        pattern = f"%{search}%"
        query = query.filter(or_(
            Candidate.full_name.ilike(pattern),
            Candidate.email.ilike(pattern),
            Candidate.applied_role.ilike(pattern),
        ))
        
    return query.offset(skip).limit(limit).all()

@router.get("/{candidate_id}", response_model=CandidateResponse)
def get_candidate(
    candidate_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    query = db.query(Candidate).filter(Candidate.id == candidate_id)
    if not current_user.role or current_user.role.name != "Admin":
        query = query.join(Resume).filter(Resume.uploader_id == current_user.id)
        
    candidate = query.first()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
    return candidate

@router.delete("/{candidate_id}", status_code=204)
def delete_candidate(
    candidate_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    query = db.query(Candidate).filter(Candidate.id == candidate_id)
    if not current_user.role or current_user.role.name != "Admin":
        query = query.join(Resume).filter(Resume.uploader_id == current_user.id)
        
    candidate = query.first()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
        
    db.delete(candidate)
    db.commit()
    return None
