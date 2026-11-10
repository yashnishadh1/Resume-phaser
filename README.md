# HireLens

**See Your Potential. Land Your Next Opportunity.**

HireLens provides resume analysis, ATS-oriented signals, skill extraction, and job-description matching for recruiters. The current matching engine is heuristic and should support human review, not replace it.

## Product

- Upload PDF or DOCX resumes for validation, malware scanning, and background parsing.
- Review candidate details, experience, skills, status, and match scores.
- Search and filter candidates, inspect profiles, delete records, and export candidate data.
- Compare a job description with candidate profiles.

## Stack

- Frontend: React, TypeScript, Vite, Tailwind CSS, React Query, Vitest, and React Testing Library.
- Backend: FastAPI, SQLAlchemy, PostgreSQL, Alembic, Celery, Redis, and ClamAV.
- Deployment: Vercel frontend configuration and Docker Compose backend services.

## Local development

### Frontend

```bash
npm ci
npm run dev
```

Set `VITE_API_BASE_URL` when the API is not available at `http://localhost:8000/api/v1`. Set `VITE_SITE_URL` to the canonical public origin for production metadata.

### Backend

Create `backend/.env` from `backend/.env.example`, set a strong `SECRET_KEY` and database credentials, then start the services from `backend/`:

```bash
docker compose up --build
```

The API listens on `127.0.0.1:8000` by default. Resume uploads require the ClamAV service. Follow [backend development](docs/development.md) for alternatives and setup details.

## Verification

```bash
npm run lint
npm run build
npm run test -- --run
npm run coverage
```

Backend tests use pytest and an isolated SQLite fixture:

```bash
cd backend
python -m pytest --cov=app --cov-report=term-missing
```

Coverage status is generated from the current suite and is not represented by static badges. Review [CI/CD](docs/ci-cd.md), [security](docs/security.md), [deployment](docs/deployment.md), [architecture](docs/architecture.md), and [API documentation](docs/api.md).

## Production setup still required

Before launch, configure the public domain, backend origin, database and Redis services, ClamAV, support contact, retention/deletion procedures, monitoring, and legal business details. The Privacy Policy and Terms pages contain clearly marked operator placeholders that need confirmation and legal review.
