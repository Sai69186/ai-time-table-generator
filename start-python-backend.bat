@echo off
echo Starting AI Timetable Generator Python Backend...
echo ================================================

cd python-backend

echo Installing/updating dependencies...
pip install -r requirements.txt

echo.
echo Setting up database...
python setup_db.py

echo.
echo Starting FastAPI server...
echo Server will be available at: http://localhost:3000
echo API Documentation: http://localhost:3000/docs
echo Press Ctrl+C to stop the server
echo.

python start.py

pause