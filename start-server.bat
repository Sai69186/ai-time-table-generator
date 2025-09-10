@echo off
echo Starting AI Timetable Generator...
echo ================================

echo Step 1: Setting up database...
cd python-backend
python setup_db.py

echo.
echo Step 2: Starting Python backend...
python start.py

pause