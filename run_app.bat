@echo off
echo Starting AI Timetable Generator
echo ===============================

echo.
echo [1/3] Setting up database...
python setup_database.py
if %errorlevel% neq 0 (
    echo Database setup failed!
    pause
    exit /b 1
)

echo.
echo [2/3] Starting backend server...
start "Backend Server" cmd /k "cd python-backend && python main.py"

echo.
echo [3/3] Starting frontend server...
timeout /t 3 /nobreak > nul
start "Frontend Server" cmd /k "python serve_frontend.py"

echo.
echo Both servers are starting...
echo Backend: http://localhost:3000
echo Frontend: http://localhost:8080
echo.
echo Press any key to exit...
pause > nul