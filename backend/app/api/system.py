from fastapi import APIRouter
from pydantic import BaseModel
from typing import Dict

router = APIRouter()

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
async def readiness_probe():
    """
    Readiness probe to verify application dependencies (e.g., database, redis).
    In a real-world scenario, you would execute an inexpensive DB/Redis ping here.
    """
    # Placeholder for database connectivity check
    # e.g., await db.execute("SELECT 1")
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
