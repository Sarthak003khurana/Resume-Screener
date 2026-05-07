@echo off

echo ===============================
echo Starting Resume Screener AI
echo ===============================

echo.
echo Activating Python environment...
call ResumeSERV\Scripts\activate

echo.
echo Starting Backend...
cd backend
start cmd /k "python app.py"

echo Backend running at:
echo http://127.0.0.1:5000

echo.
echo Starting Frontend...
cd ..
start cmd /k "npm run dev"

echo Frontend running at:
echo http://localhost:5173

echo.
echo ===============================
echo Servers are starting...
echo ===============================

pause