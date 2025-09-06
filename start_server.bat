@echo off
echo Starting AI Timetable Generator Server...
echo =====================================

echo Checking Python installation...
python --version
if %errorlevel% neq 0 (
    echo Python is not installed or not in PATH
    pause
    exit /b 1
)

echo.
echo Setting up database...
python setup_database.py

if %errorlevel% neq 0 (
    echo Database setup failed!
    pause
    exit /b 1
)

echo.
echo Starting Python backend server...
cd python-backend
python main.py

pause