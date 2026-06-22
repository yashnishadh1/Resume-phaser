# API Documentation

The Resume Parser AI exposes a RESTful API built with FastAPI. All requests and responses are standard `application/json` unless otherwise specified.

## Base URL
All API endpoints are mounted under:
`http://localhost:8000/api/v1`

## Authentication

Most endpoints require a valid JWT Access Token.
Provide the token in the `Authorization` header:
```http
Authorization: Bearer <your_jwt_access_token>
```

## Endpoints

### 1. Authentication (`/auth`)

#### `POST /auth/login`
Authenticates a user and returns an access token.
- **Body**: `OAuth2PasswordRequestForm` (Form Data: `username`, `password`)
- **Response**: 
  ```json
  {
    "access_token": "eyJhb...",
    "token_type": "bearer",
    "user": {
      "id": 1,
      "email": "recruiter@example.com",
      "role": "recruiter"
    }
  }
  ```

#### `POST /auth/register`
Registers a new user.
- **Body (JSON)**: `{"email": "...", "password": "...", "full_name": "..."}`
- **Response**: User object without password.

### 2. Candidates (`/candidates`)

#### `GET /candidates`
Retrieves a paginated list of candidates belonging to the authenticated user.
- **Query Params**: `skip` (int, default: 0), `limit` (int, default: 100), `search` (string, optional)
- **Response**: Array of Candidate objects.

#### `DELETE /candidates/{candidate_id}`
Deletes a specific candidate.

### 3. Resumes (`/resumes`)

#### `POST /resumes/upload`
Uploads a resume for parsing.
- **Content-Type**: `multipart/form-data`
- **Body**: `file` (Binary PDF/DOCX)
- **Response**: 
  ```json
  {
    "id": 12,
    "filename": "john_doe.pdf",
    "status": "processing",
    "message": "Resume uploaded successfully"
  }
  ```

### 4. JD Matching (`/jd`)

#### `POST /jd/match`
Matches candidates against a provided Job Description.
- **Body (JSON)**: `{"job_description": "We need a Python engineer..."}`
- **Response**: 
  ```json
  [
    {
      "candidate_id": 12,
      "name": "John Doe",
      "match_score": 85.5,
      "matching_skills": ["Python", "FastAPI"]
    }
  ]
  ```

### 5. Export (`/export`)

#### `GET /export/csv`
Exports the user's candidates as a CSV file.
- **Response**: `text/csv` downloadable file attachment.

### 6. System (`/system`)

Used for Kubernetes and infrastructure health probes.
- **`GET /system/live`**: Liveness probe (200 OK).
- **`GET /system/ready`**: Readiness probe (200 OK).
- **`GET /system/health`**: Extensive system telemetry (RAM, Uptime).
