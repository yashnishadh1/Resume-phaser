# Troubleshooting Guide

This document catalogs common errors encountered during local development or production deployment, alongside their resolutions.

## Backend Errors

### 1. `sqlalchemy.exc.OperationalError: FATAL: password authentication failed for user "postgres"`
**Cause**: The credentials in your `backend/.env` do not match your local PostgreSQL server configuration.
**Fix**: Ensure `POSTGRES_USER` and `POSTGRES_PASSWORD` are correct. If you are using Windows, ensure the PostgreSQL service is actively running via `services.msc`.

### 2. `alembic.util.exc.CommandError: Target database is not up to date.`
**Cause**: You are attempting to run an autogenerate migration when the database has not applied existing migrations.
**Fix**: Run `alembic upgrade head` before creating new migrations.

### 3. `ModuleNotFoundError: No module named 'psutil'`
**Cause**: Python is missing dependencies, likely because you forgot to activate your virtual environment.
**Fix**: Run `.\venv\Scripts\activate` (Windows) or `source venv/bin/activate` (Mac/Linux), then `pip install -r requirements.txt`.

### 4. `Error: Base UI: MenuGroupContext is missing`
**Cause**: You wrote a frontend test targeting a Base UI component but did not wrap the component in its necessary Parent Context (`DropdownMenuGroup`).
**Fix**: Review your TSX test file and ensure the primitive elements follow the Base UI required DOM hierarchy.

## Observability & Monitoring Errors

### 1. Sentry is not logging errors
**Cause**: Your `SENTRY_DSN` is empty or malformed.
**Fix**: Ensure your `.env` contains a valid DSN. Note that the FastAPI integration requires `FastApiIntegration` (with a lowercase 'p' and 'i') when importing from `sentry-sdk==2.20+`.

### 2. Cannot find `X-Request-ID` in logs
**Cause**: The structured JSON logger might not be correctly configured to read from `asgi-correlation-id`.
**Fix**: Check `app/main.py`. Ensure the `logging.setLogRecordFactory(record_factory)` hook is injecting `correlation_id.get()` into the record object.

## General Debugging Steps
If the application crashes without obvious terminal errors:
1. Hit `http://127.0.0.1:8000/api/v1/system/health` to verify the backend event loop is processing requests.
2. Check `http://127.0.0.1:8000/metrics` to ensure Prometheus metrics are actively updating.
3. Inspect `backend/resume_parser.db` if testing locally via SQLite (though Postgres is highly recommended).
