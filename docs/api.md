# HireLens API

The FastAPI service is mounted at `/api/v1`. JSON request examples below omit routine response fields. Authenticated requests use `Authorization: Bearer <access_token>`.

## Authentication (`/auth`)

| Method and route | Request | Result |
|---|---|---|
| `POST /auth/register` | JSON: `email`, `password`, `full_name`, optional `company_name` | Creates an account. Password requires upper/lowercase, a number, a symbol, and at least 8 characters. |
| `POST /auth/login` | JSON: `email`, `password` | Access and refresh tokens. |
| `POST /auth/refresh` | JSON: `refresh_token` | Rotates the refresh token and returns a new token pair. |
| `POST /auth/logout` | JSON: `refresh_token` | Revokes that refresh token. |
| `GET /auth/me` | Bearer token | Current account. |
| `PATCH /auth/me` | JSON: `full_name` | Updates the current account name. |
| `POST /auth/password` | JSON: `current_password`, `new_password` | Changes password and revokes the account’s refresh tokens. |

Authentication write routes are limited per source IP using Redis. Default limits are five login attempts, three registrations, thirty refreshes, and five password changes per 60-second window. A `429` response includes `Retry-After`; if Redis is unavailable these routes fail closed with `503`.

## Candidates (`/candidates`)

- `GET /candidates?skip=0&limit=100&search=...` returns candidates visible to the account. `skip` is nonnegative, `limit` is 1–1000, and search matches name, email, or applied role. Administrators can see all workspaces; other users see records linked to their own resumes.
- `GET /candidates/{candidate_id}` reads one visible candidate.
- `DELETE /candidates/{candidate_id}` deletes one visible candidate.

## Resumes (`/resumes`)

- `POST /resumes/upload` accepts one `multipart/form-data` PDF or DOCX file, validates its type and size, scans it with configured ClamAV, stores it, and queues parsing. The upload response reflects the saved resume; parsing continues in a background task.
- `GET /resumes` lists the current account’s resumes.
- `GET /resumes/{resume_id}/file` downloads a resume when the account owns it or the requester is an administrator.

The upload size limit defaults to 10 MiB and is configured with `MAX_UPLOAD_SIZE`. Uploads fail with `503` when malware scanning is unavailable.

## Job matching (`/jd`)

`POST /jd/match` accepts JSON `{ "description": "..." }`, with a nonblank description up to 20,000 characters. It returns up to ten visible candidates with a heuristic keyword similarity score, matched skills, missing skills, and recommendations. The score is a ranking aid, not a validated ATS result.

## Analytics and export

- `GET /analytics/dashboard` returns workspace-scoped candidate and parsed-resume counts, the observed average match score, and top extracted skills. Processing time is `null` because the service does not currently collect that measurement.
- `GET /export/csv` and `GET /export/json` export only records visible to the current account; administrators can export all records.

## Health and API schema

Health checks are under `/system` (`/live`, `/ready`, and `/health`). OpenAPI is served at `/api/v1/openapi.json`.
