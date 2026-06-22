# Security Model

The Resume Parser AI platform integrates multiple layers of security to protect PII (Personally Identifiable Information) extracted from resumes, ensuring that candidates and recruiters operate in a trusted environment.

## 1. Authentication & Session Management

- **Protocol**: JSON Web Tokens (JWT).
- **Lifespan**: Access tokens expire in 30 minutes. Refresh tokens (if configured) expire in 7 days.
- **Algorithm**: `HS256` symmetric signing utilizing a strong 256-bit `SECRET_KEY`.
- **Statelessness**: Session state is managed by the client. The backend validates token signatures natively without database lookups (unless validating revocation lists/refresh tokens).

## 2. Password Cryptography

- **Algorithm**: `argon2id` (via `argon2-cffi`).
- **Migration**: The system natively supports seamless migration from legacy `bcrypt` hashes. If a user logs in with a valid `bcrypt` password, the system automatically rehashing and stores the new `argon2id` hash.
- **Protection**: Defends against GPU-accelerated brute-force attacks and rainbow table computations.

## 3. Authorization & Data Isolation

- **Role-Based Access Control (RBAC)**: Currently supports `admin` and `recruiter` roles.
- **Tenant Isolation**: Every API endpoint manipulating candidate or resume records automatically enforces an ownership check.
  - A user with `id=1` cannot issue `GET /candidates/2` if candidate `2` is owned by `id=2`.
  - SQLAlchemy queries strictly append `.filter(Candidate.owner_id == current_user.id)` to all bulk retrieval actions.

## 4. Input Validation & Defense

- **File Upload Protection**:
  - File extensions are strictly checked (`.pdf`, `.docx`).
  - MIME types are validated against standard application types using python `filetype` magic number verification.
  - Hard limit on upload size (10MB default) to prevent Denial of Service (DoS) via memory exhaustion.
- **Schema Validation**: FastAPI leverages Pydantic for rigid runtime type enforcement. Malformed JSON or SQL Injection vectors in request bodies are automatically dropped with `422 Unprocessable Entity` before reaching business logic.

## 5. Network & Observability Security

- **CORS Configuration**: Cross-Origin Resource Sharing is strictly limited to authorized frontend origins defined in `BACKEND_CORS_ORIGINS`.
- **Sentry Integration**: Unhandled exceptions transmitted to Sentry undergo Data Scrubbing to remove obvious PII (Passwords, Tokens, Credit Cards) before leaving the internal network.
- **Correlation IDs**: All requests are tagged with a unique `X-Request-ID`. This prevents leaking database primary keys or internal state mechanisms in error responses to the client, while preserving traceability for operators.
