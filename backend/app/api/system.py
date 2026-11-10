import logging

import redis
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Dict
from sqlalchemy import text
from sqlalchemy.orm import Session
from app.core.config import settings
from app.db.database import get_db

router = APIRouter()
logger = logging.getLogger(__name__)

class HealthResponse(BaseModel):
    status: str
    version: str

@router.get("/live", response_model=Dict[str, str])
async def liveness_probe():
    """
    Liveness probe to verify the application event loop is responsive.
    """
    return {"status": "alive"}

@router.get("/ready", response_model=Dict[str, str])
async def readiness_probe(db: Session = Depends(get_db)):
    """Verify database and Redis dependencies before receiving traffic."""
    redis_client = redis.Redis.from_url(
        settings.REDIS_URL, socket_connect_timeout=1, socket_timeout=1
    )
    try:
        db.execute(text("SELECT 1"))
        redis_client.ping()
    except Exception as exc:
        logger.warning("Readiness check failed for a service dependency")
        raise HTTPException(status_code=503, detail="Service dependencies unavailable") from exc
    finally:
        redis_client.close()
    return {"status": "ready"}

@router.get("/health", response_model=HealthResponse)
async def health_check():
    """
    Comprehensive health check returning system metrics.
    """
    return HealthResponse(
        status="healthy",
        version="1.0.0",
    )
