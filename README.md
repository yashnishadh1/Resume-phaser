# Resume Parser AI 🚀

[![Frontend Tests](https://img.shields.io/badge/Frontend%20Coverage-81%25-success)](docs/ci-cd.md)
[![Backend Tests](https://img.shields.io/badge/Backend%20Coverage-82%25-success)](docs/ci-cd.md)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

An enterprise-grade, full-stack Resume Parsing Applicant Tracking System (ATS). It leverages Python's NLP capabilities to extract structured data from resumes (PDFs/DOCXs) and provides a sleek, modern React frontend for recruiters to match candidates against Job Descriptions (JDs).

## 🌟 Key Features

- **Automated Resume Parsing**: Extracts Name, Email, Phone, Skills, and Education from raw PDF/DOCX files.
- **JD Matching Engine**: Scores and ranks parsed candidates against Job Descriptions using intelligent NLP extraction.
- **Role-Based Access Control**: Secure JWT authentication ensuring data isolation between recruiters.
- **Comprehensive Analytics**: Dashboard visualizations of parsing success rates and candidate distributions.
- **CSV Export**: Securely export candidate data for offline processing.
- **Production Observability**: Built-in Sentry integration, structured JSON logging, and Prometheus metrics.

## 🏗️ Architecture Overview

The system follows a modern decoupled architecture:
- **Frontend**: React 18, Vite, Tailwind CSS, Base UI, and React Query for intelligent data fetching and caching.
- **Backend**: FastAPI (Python 3.13), SQLAlchemy 2.0, PostgreSQL, and Alembic for migrations.
- **Asynchronous Tasks**: Celery and Redis to handle heavy parsing tasks and OCR fallbacks in the background.

For a detailed view of the system components, see the [Architecture Documentation](docs/architecture.md).

## 📚 Documentation

Detailed documentation is available in the `docs/` directory:

1. [Architecture & Design](docs/architecture.md)
2. [API Reference](docs/api.md)
3. [Security Model](docs/security.md)
4. [Deployment Guide](docs/deployment.md)
5. [Local Development](docs/development.md)
6. [CI/CD Pipelines](docs/ci-cd.md)
7. [Troubleshooting](docs/troubleshooting.md)

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js (v20+)
- Python (3.13+)
- PostgreSQL
- Redis

### 1. Clone & Database Setup
```bash
git clone https://github.com/yashnishadh1/Resume-phaser.git
cd Resume-phaser
```
Ensure you have a local PostgreSQL instance running and create a database named `resume_parser`.

### 2. Backend Setup
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
alembic upgrade head
python start_backend.bat
```

### 3. Frontend Setup
```bash
npm install
npm run dev
```

For detailed instructions, refer to the [Local Development Guide](docs/development.md).

## 🧪 Testing

We maintain strict coverage thresholds (>70%) across the stack.

- **Frontend**: Vitest and React Testing Library (`npm run test -- --coverage`)
- **Backend**: Pytest and HTTPX (`pytest tests/ --cov=app`)

See the [CI/CD Documentation](docs/ci-cd.md) for automated pipeline details.

## 🤝 Contributing
1. Create a Feature Branch (`git checkout -b feature/AmazingFeature`)
2. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
3. Push to the Branch (`git push origin feature/AmazingFeature`)
4. Open a Pull Request
