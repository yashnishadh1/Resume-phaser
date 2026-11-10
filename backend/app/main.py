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
from starlette.responses import JSONResponse as StarletteJSONResponse
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
    allow_credentials=False,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["Authorization", "Content-Type"],
)


class UploadRequestLimitMiddleware:
    """Bound upload request bodies before multipart parsing allocates resources."""

    def __init__(self, app, max_bytes: int):
        self.app = app
        # Leave room for multipart boundaries and headers around the file bytes.
        self.max_bytes = max_bytes + 1024 * 1024

    async def __call__(self, scope, receive, send):
        if not (
            scope["type"] == "http"
            and scope.get("method") == "POST"
            and scope.get("path") == f"{settings.API_V1_STR}/resumes/upload"
        ):
            await self.app(scope, receive, send)
            return

        headers = dict(scope.get("headers", []))
        try:
            content_length = int(headers.get(b"content-length", b"0"))
        except ValueError:
            content_length = 0
        if content_length > self.max_bytes:
            await StarletteJSONResponse(
                {"detail": "Upload request too large"}, status_code=413
            )(scope, receive, send)
            return

        received = 0
        too_large = False

        async def limited_receive():
            nonlocal received, too_large
            message = await receive()
            if message["type"] == "http.request":
                received += len(message.get("body", b""))
                if received > self.max_bytes:
                    too_large = True
                    return {"type": "http.disconnect"}
            return message

        async def limited_send(message):
            if not too_large:
                await send(message)

        try:
            await self.app(scope, limited_receive, limited_send)
        except Exception:
            if not too_large:
                raise
        if too_large:
            await StarletteJSONResponse(
                {"detail": "Upload request too large"}, status_code=413
            )(scope, receive, send)

# Add correlation ID middleware
app.add_middleware(CorrelationIdMiddleware)

# Collect metrics internally; do not publish an unauthenticated /metrics route.
Instrumentator().instrument(app)

# Ensure upload directory exists
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

# Global Exception Handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "message": "An unexpected error occurred. Please try again later.",
            "detail": str(exc) if getattr(settings, "DEBUG", False) else "Internal Server Error"
        }
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

# Wrap the whole FastAPI stack so oversized upload bodies are rejected before
# Starlette's multipart parser has to spool or parse them.
app.add_middleware(UploadRequestLimitMiddleware, max_bytes=settings.MAX_UPLOAD_SIZE)
