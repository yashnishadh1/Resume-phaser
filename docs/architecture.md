# System Architecture

The Resume Parser AI platform is built upon a decoupled, service-oriented architecture designed for scalability, maintainability, and high observability.

## High-Level Architecture Diagram

```mermaid
graph TD
    %% Users
    Recruiter([Recruiter / HR])
    
    %% Frontend
    subgraph Frontend [Client Tier - React + Vite]
        UI[Web UI]
        State[React Query / Context]
    end
    
    %% Backend
    subgraph Backend [Application Tier - FastAPI]
        API[FastAPI Endpoints]
        AuthService[Auth Service]
        ParserService[Parser Service]
        MatchEngine[JD Matching Engine]
        Obs[Observability / Sentry]
    end
    
    %% Async Workers
    subgraph Async [Worker Tier - Celery]
        Worker1[Celery Parser Worker]
        OCR[Tesseract OCR Engine]
    end
    
    %% Data Tier
    subgraph Data [Data Tier]
        PG[(PostgreSQL)]
        Redis[(Redis Cache/Broker)]
        FS[Local File Storage / S3]
    end
    
    %% Relationships
    Recruiter -->|HTTPS| UI
    UI -->|JSON requests| State
    State -->|RESTful API| API
    
    API --> AuthService
    API --> ParserService
    API --> MatchEngine
    API -.->|Metrics/Logs| Obs
    
    ParserService -->|Queue Task| Redis
    Redis -->|Consume Task| Worker1
    Worker1 --> OCR
    
    AuthService --> PG
    MatchEngine --> PG
    Worker1 -->|Store Results| PG
    Worker1 -->|Save Document| FS
    API -->|Read Document| FS
```

## Component Breakdown

### 1. Client Tier (Frontend)
- **Technology**: React 18, TypeScript, Vite.
- **Routing**: `react-router-dom` manages protected and unprotected routes.
- **State Management**: `@tanstack/react-query` is utilized for server-state synchronization (caching, deduplication, optimistic updates).
- **Styling**: Tailwind CSS combined with Base UI primitives for an accessible, headless design system.

### 2. Application Tier (Backend)
- **Technology**: FastAPI, Python 3.13.
- **Concurrency**: Uvicorn runs the ASGI application utilizing Python's `asyncio` for non-blocking network I/O.
- **Authentication**: JWT-based stateless authentication. All tokens are signed symmetrically (`HS256`).
- **Observability**: Implements `prometheus-fastapi-instrumentator` for /metrics, `asgi-correlation-id` for distributed request tracing, and Sentry for error telemetry.

### 3. Worker Tier (Asynchronous Processing)
- **Technology**: Celery + Redis.
- **Purpose**: Parsing a resume (especially using PyTesseract for OCR) is CPU-bound and latent. Celery shifts this load off the FastAPI event loop, ensuring the web server remains responsive.
- **Flow**: Upload -> Store File -> Enqueue Task -> Return Job ID -> Worker parses -> Update DB.

### 4. Data Tier
- **Relational Database**: PostgreSQL. Interfaced via SQLAlchemy 2.0 ORM.
- **Schema Migrations**: Managed declaratively via Alembic.
- **Object Storage**: Resumes are currently written to a local `./uploads` directory. In production, this layer abstract is designed to easily swap to AWS S3 or Azure Blob Storage.
