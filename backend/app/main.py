# pyrefly: ignore [missing-import]
from fastapi import FastAPI, Request
# pyrefly: ignore [missing-import]
from fastapi.middleware.cors import CORSMiddleware
# pyrefly: ignore [missing-import]
from fastapi.responses import JSONResponse
# pyrefly: ignore [missing-import]
import sentry_sdk
from app.core.config import settings
import os
import logging
from pythonjsonlogger import jsonlogger
from asgi_correlation_id import CorrelationIdMiddleware, correlation_id
from prometheus_fastapi_instrumentator import Instrumentator
from sentry_sdk.integrations.fastapi import FastApiIntegration
from sentry_sdk.integrations.starlette import StarletteIntegration

# Setup structured JSON logging
logger = logging.getLogger(__name__)
log_handler = logging.StreamHandler()
formatter = jsonlogger.JsonFormatter(
    '%(asctime)s %(levelname)s %(name)s %(correlation_id)s %(message)s'
)
log_handler.setFormatter(formatter)
logging.basicConfig(handlers=[log_handler], level=logging.INFO)

# Inject correlation ID into log records
old_factory = logging.getLogRecordFactory()

def record_factory(*args, **kwargs):
    record = old_factory(*args, **kwargs)
    record.correlation_id = correlation_id.get()
    return record

logging.setLogRecordFactory(record_factory)

if settings.SENTRY_DSN:
    sentry_sdk.init(
        dsn=settings.SENTRY_DSN,
        traces_sample_rate=1.0,
        integrations=[
            StarletteIntegration(transaction_style="endpoint"),
            FastApiIntegration(transaction_style="endpoint"),
        ],
    )

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# CORS configuration
origins = settings.BACKEND_CORS_ORIGINS if hasattr(settings, 'BACKEND_CORS_ORIGINS') and settings.BACKEND_CORS_ORIGINS else []

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
)

# Add correlation ID middleware
app.add_middleware(CorrelationIdMiddleware)

# Expose Prometheus metrics
Instrumentator().instrument(app).expose(app)

# Ensure upload directory exists
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

# Global Exception Handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    
    origin = request.headers.get("origin")
    headers = {}
    if origin:
        headers["Access-Control-Allow-Origin"] = origin
        headers["Access-Control-Allow-Credentials"] = "true"
        
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "message": "An unexpected error occurred. Please try again later.",
            "detail": str(exc) if getattr(settings, "DEBUG", False) else "Internal Server Error"
        },
        headers=headers
    )

@app.get("/")
def read_root():
    return {"message": "Welcome to Resume Parser AI API"}

from app.api import auth, resumes, candidates, analytics, jd, export, system
from alembic.config import Config
from alembic import command
import os

@app.on_event("startup")
async def startup_event():
    logger.info("Running database migrations...")
    try:
        # Get the path to alembic.ini relative to main.py
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        alembic_ini_path = os.path.join(base_dir, "alembic.ini")
        
        # Ensure we're in the right directory so alembic can find env.py
        current_dir = os.getcwd()
        os.chdir(base_dir)
        
        alembic_cfg = Config(alembic_ini_path)
        command.upgrade(alembic_cfg, "head")
        
        os.chdir(current_dir)
        logger.info("Database migrations completed successfully.")
    except Exception as e:
        logger.error(f"Failed to run migrations: {e}")

# Router inclusion
app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["auth"])
app.include_router(resumes.router, prefix=f"{settings.API_V1_STR}/resumes", tags=["resumes"])
app.include_router(candidates.router, prefix=f"{settings.API_V1_STR}/candidates", tags=["candidates"])
app.include_router(analytics.router, prefix=f"{settings.API_V1_STR}/analytics", tags=["analytics"])
app.include_router(jd.router, prefix=f"{settings.API_V1_STR}/jd", tags=["jd"])
app.include_router(export.router, prefix=f"{settings.API_V1_STR}/export", tags=["export"])
app.include_router(system.router, prefix=f"{settings.API_V1_STR}/system", tags=["system"])
