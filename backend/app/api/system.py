import os
import psutil
from fastapi import APIRouter
from pydantic import BaseModel
from typing import Dict, Any

router = APIRouter()

class HealthResponse(BaseModel):
    status: str
    version: str
    uptime: float
    memory_usage_mb: float
    environment: str

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
    process = psutil.Process(os.getpid())
    memory_info = process.memory_info()
    
    # Calculate uptime (simplistic for example, from process creation)
    # Using psutil.boot_time() or process.create_time()
    uptime_seconds = os.times().elapsed if hasattr(os.times(), 'elapsed') else 0.0 # fallback

    return HealthResponse(
        status="healthy",
        version="1.0.0",
        uptime=uptime_seconds,
        memory_usage_mb=memory_info.rss / (1024 * 1024),
        environment=os.getenv("ENVIRONMENT", "production")
    )
