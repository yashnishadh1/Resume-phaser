import os
from celery import Celery
from app.core.config import settings

celery_app = Celery(
    "resume_parser",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
)

@celery_app.task(name="parse_resume_task")
def parse_resume_task(resume_id: int):
    # This task will be implemented properly when we hook up DB and services
    from app.services.parser import ResumeParserService
    from app.db.database import SessionLocal
    
    db = SessionLocal()
    try:
        service = ResumeParserService(db)
        service.process_resume(resume_id)
    finally:
        db.close()
    return {"status": "completed", "resume_id": resume_id}
