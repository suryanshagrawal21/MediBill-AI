@echo off
echo ========================================
echo   MediBill AI - Starting Backend
echo ========================================
cd /d "c:\Users\surya\Desktop\PROJECTS\MediBill AI\MediBillAI"
echo Activating virtual environment...
call .venv\Scripts\activate.bat
echo Starting FastAPI on http://localhost:8000 ...
python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
pause
