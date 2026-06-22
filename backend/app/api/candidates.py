from fastapi import APIRouter, Depends, HTTPException, Query
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
    skip: int = 0,
    limit: int = 100,
    search: str = None,
    current_user: User = Depends(deps.get_current_active_user)
):
    query = db.query(Candidate)
    
    if not current_user.role or current_user.role.name != "Admin":
        query = query.join(Resume).filter(Resume.uploader_id == current_user.id)
    
    if search:
        query = query.filter(Candidate.full_name.ilike(f"%{search}%"))
        
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
