# pyrefly: ignore [missing-import]
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, BackgroundTasks
# pyrefly: ignore [missing-import]
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.api import deps
from app.models.user import User
from app.models.resume import Resume
from app.schemas.resume import ResumeResponse
from app.core.config import settings
import shutil
import os
import uuid

router = APIRouter()

def trigger_parsing(resume_id: int):
    try:
        from app.jobs.celery_worker import parse_resume_task
        # Call the task directly in the BackgroundTask thread to bypass Celery/Redis
        parse_resume_task(resume_id)
    except Exception as e:
        print(f"Failed to parse resume: {e}")

@router.post("/upload", response_model=ResumeResponse)
async def upload_resume(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    size = file.size if file.size is not None else 0
    if size > settings.MAX_UPLOAD_SIZE:
        raise HTTPException(status_code=400, detail="File too large")
        
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in [".pdf", ".docx", ".doc"]:
        raise HTTPException(status_code=400, detail="Invalid file type")

    filename = f"{uuid.uuid4()}_{file.filename}"
    file_path = os.path.join(settings.UPLOAD_DIR, filename)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    resume = Resume(
        filename=file.filename,
        file_path=file_path,
        mime_type=file.content_type,
        file_size=file.size,
        uploader_id=current_user.id
    )
    db.add(resume)
    db.commit()
    db.refresh(resume)
    
    # Trigger background celery task gracefully without blocking the response
    background_tasks.add_task(trigger_parsing, resume.id)
    
    return resume

@router.get("", response_model=list[ResumeResponse])
def get_resumes(
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    return db.query(Resume).filter(Resume.uploader_id == current_user.id).all()
