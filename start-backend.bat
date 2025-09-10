@echo off
echo Starting AI Timetable Generator Backend...
cd python-backend
python -m pip install -r requirements.txt
python main.py
pause