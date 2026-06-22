# Local Development Guide

This document outlines how to set up the Resume Parser AI platform on your local machine for active development.

## Prerequisites
- Node.js (v20+)
- Python (3.13+)
- PostgreSQL installed and running locally on port `5432`
- Redis installed and running locally on port `6379`
- Git

## 1. Database Setup

Ensure PostgreSQL is running. Open `psql` or pgAdmin and create a database:
```sql
CREATE DATABASE resume_parser;
```
Ensure the default user (`postgres`) with password (`postgres`) has access. If your local credentials differ, update the `.env` file in the backend.

## 2. Backend Setup

Open a new terminal session.

```bash
cd backend

# Create and activate a virtual environment
python -m venv venv
# On Windows:
venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
alembic upgrade head

# Start the development server
python start_backend.bat
# Or run manually: uvicorn app.main:app --reload
```

The backend API will be available at `http://127.0.0.1:8000`. 
Swagger UI documentation is auto-generated at `http://127.0.0.1:8000/docs`.

## 3. Frontend Setup

Open a separate terminal session.

```bash
# Navigate to the root directory
npm install

# Start the Vite development server
npm run dev
```

The frontend will be available at `http://localhost:5173`. Any changes to the React source files will hot-reload automatically.

## 4. Running the Tests

We use Test Driven Development (TDD) principles.

### Frontend Tests
We use Vitest and React Testing Library.
```bash
npm run test
# Run with coverage report
npm run test -- --coverage
```

### Backend Tests
We use Pytest.
```bash
cd backend
venv\Scripts\activate
python -m pytest tests
# Run with coverage report
pytest tests --cov=app
```
