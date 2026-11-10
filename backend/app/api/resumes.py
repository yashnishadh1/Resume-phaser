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
import os
import uuid
import socket
import struct
import zipfile
import re
# pyrefly: ignore [missing-import]
import filetype
import logging
from starlette.concurrency import run_in_threadpool

logger = logging.getLogger(__name__)

def scan_file_for_viruses(file_path: str) -> bool:
    if not settings.CLAMAV_HOST:
        raise RuntimeError("ClamAV is not configured")

    with socket.create_connection(
        (settings.CLAMAV_HOST, settings.CLAMAV_PORT), timeout=settings.CLAMAV_TIMEOUT
    ) as client:
        client.settimeout(settings.CLAMAV_TIMEOUT)
        client.sendall(b"zINSTREAM\0")
        with open(file_path, "rb") as uploaded:
            while chunk := uploaded.read(64 * 1024):
                client.sendall(struct.pack(">I", len(chunk)))
                client.sendall(chunk)
        client.sendall(struct.pack(">I", 0))

        response = b""
        while b"\0" not in response:
            part = client.recv(4096)
            if not part:
                raise RuntimeError("ClamAV closed the connection without a verdict")
            response += part

    verdict = response.split(b"\0", 1)[0].decode("ascii", errors="replace")
    if verdict.endswith(" OK"):
        return True
    if verdict.endswith(" FOUND"):
        return False
    raise RuntimeError("ClamAV returned an invalid scan verdict")


def validate_docx_archive(file_path: str) -> bool:
    try:
        with zipfile.ZipFile(file_path) as archive:
            members = archive.infolist()
            if len(members) > 1000:
                return False
            total_uncompressed = 0
            for member in members:
                if member.flag_bits & 0x1:
                    return False
                total_uncompressed += member.file_size
                if member.file_size > 20 * 1024 * 1024:
                    return False
                if member.file_size > 0 and (
                    member.compress_size == 0
                    or member.file_size / member.compress_size > 100
                ):
                    return False
            names = {member.filename for member in members}
            return (
                total_uncompressed <= 50 * 1024 * 1024
                and "[Content_Types].xml" in names
                and "word/document.xml" in names
            )
    except (OSError, zipfile.BadZipFile, RuntimeError):
        return False

router = APIRouter()

def trigger_parsing(resume_id: int):
    try:
        from app.services.parser import ResumeParserService
        from app.db.database import SessionLocal
        db = SessionLocal()
        try:
            service = ResumeParserService(db)
            service.process_resume(resume_id)
        finally:
            db.close()
    except Exception as e:
        print(f"Failed to parse resume: {e}")

@router.post("/upload", response_model=ResumeResponse)
async def upload_resume(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    original_name = (file.filename or "resume").replace("\\", "/")
    display_name = os.path.basename(original_name)
    display_name = re.sub(r"[\x00-\x1f\x7f]", "_", display_name)[:255] or "resume"
    ext = os.path.splitext(display_name)[1].lower()
    if ext not in [".pdf", ".docx"]:
        raise HTTPException(status_code=400, detail="Only PDF and DOCX files are supported")

    allowed_mime_types = [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ]
    if file.content_type not in allowed_mime_types:
        raise HTTPException(status_code=400, detail="Invalid content type")

    filename = f"{uuid.uuid4()}{ext}"
    file_path = os.path.join(settings.UPLOAD_DIR, filename)
    actual_size = 0
    try:
        with open(file_path, "wb") as destination:
            while chunk := await file.read(64 * 1024):
                actual_size += len(chunk)
                if actual_size > settings.MAX_UPLOAD_SIZE:
                    raise HTTPException(status_code=413, detail="File too large")
                destination.write(chunk)

        kind = filetype.guess(file_path)
        if ext == ".pdf" and (kind is None or kind.extension != "pdf"):
            raise HTTPException(status_code=400, detail="Invalid PDF file")
        if ext == ".docx" and (
            kind is None
            or kind.extension not in {"docx", "zip"}
            or not validate_docx_archive(file_path)
        ):
            raise HTTPException(status_code=400, detail="Invalid DOCX file")

        try:
            clean = await run_in_threadpool(scan_file_for_viruses, file_path)
        except (OSError, RuntimeError, socket.timeout) as exc:
            logger.error("Resume malware scan unavailable: %s", exc)
            raise HTTPException(
                status_code=503,
                detail="Resume scanning is unavailable; try again later",
            ) from exc
        if not clean:
            raise HTTPException(status_code=400, detail="File rejected by malware scan")

        resume = Resume(
            filename=display_name,
            file_path=file_path,
            mime_type=file.content_type,
            file_size=actual_size,
            uploader_id=current_user.id,
        )
        db.add(resume)
        db.commit()
        db.refresh(resume)
        background_tasks.add_task(trigger_parsing, resume.id)
        return resume
    except HTTPException:
        db.rollback()
        if os.path.exists(file_path):
            os.remove(file_path)
        raise
    except Exception as exc:
        db.rollback()
        if os.path.exists(file_path):
            os.remove(file_path)
        logger.exception("Resume upload failed")
        raise HTTPException(status_code=500, detail="Resume upload failed") from exc
    finally:
        await file.close()

@router.get("", response_model=list[ResumeResponse])
def get_resumes(
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    return db.query(Resume).filter(Resume.uploader_id == current_user.id).all()

from fastapi.responses import FileResponse

@router.get("/{resume_id}/file")
def get_resume_file(
    resume_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    # Depending on role, allow admin to view any resume, or user to view own
    query = db.query(Resume).filter(Resume.id == resume_id)
    if not current_user.role or current_user.role.name != "Admin":
        query = query.filter(Resume.uploader_id == current_user.id)
    
    resume = query.first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
        
    if not os.path.exists(resume.file_path):
        raise HTTPException(status_code=404, detail="File not found on server")
        
    return FileResponse(
        resume.file_path, 
        media_type=resume.mime_type or "application/pdf", 
        filename=resume.filename
    )
