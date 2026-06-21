@echo off
cd backend
if not exist "venv\Scripts\activate.bat" (
    echo Virtual environment not found. Please create one and install requirements.
    exit /b 1
)
call venv\Scripts\activate.bat
echo Starting FastAPI server...
python -m uvicorn app.main:app --reload --port 8000
