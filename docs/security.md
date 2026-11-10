# Security Model

The service handles resumes and candidate PII. Deploy it only over HTTPS, keep the database and Redis on a private network, and provide strong secrets through the deployment environment.

## Authentication and authorization

- Passwords are hashed with Argon2id. Legacy bcrypt hashes are rehashed after successful login.
- Access tokens are short lived JWTs. Refresh tokens are stored as SHA-256 hashes and rotated when refreshed.
- Refresh and logout tokens are sent in JSON request bodies, never in URLs.
- Candidate lists, individual candidate records, resume lists, resume downloads, and job-description matching are restricted to the uploading user. Admins can access all accounts' records.

## Resume uploads

- Only PDF and DOCX files are accepted. Both the MIME type and file signature are checked; DOCX ZIP contents and expanded size are bounded.
- The upload request body is bounded before multipart parsing, and the saved file is capped at `MAX_UPLOAD_SIZE`.
- Uploads are scanned through the ClamAV INSTREAM protocol. Scanning fails closed: uploads return `503` until a ClamAV service is configured and reachable.
- Uploaded files are stored under generated names. The original filename is retained only as sanitized display metadata.

## Network and deployment

- Configure `BACKEND_CORS_ORIGINS` with exact frontend origins. Credentialed wildcard origins are not enabled.
- The included Compose setup requires explicit database and JWT secrets, keeps Postgres and Redis private to the Compose network, and binds the API port to localhost.
- Protect production database, Redis, and ClamAV services with network controls. Do not expose ClamAV's scan port publicly.
- Keep dependencies patched and regenerate `requirements.lock` whenever `requirements.txt` changes.
