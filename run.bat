@echo off

echo ===============================
echo Starting Resume Screener AI
echo ===============================

echo.
echo Starting Backend...

start cmd /k "cd /d %~dp0backend && ..\ResumeSERV\Scripts\activate && python app.py"

echo Backend running at:
echo http://127.0.0.1:5000

echo.
echo Starting Frontend...

start cmd /k "cd /d %~dp0 && npm run dev"

echo Frontend running at:
echo http://localhost:5173

echo.
echo ===============================
echo Servers are starting...
echo ===============================

pause 