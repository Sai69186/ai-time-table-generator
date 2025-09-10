@echo off
echo Starting AI Timetable Generator (Node.js)...
echo ==========================================

echo Checking if Node.js is installed...
node --version
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo.
echo Installing dependencies...
npm install

echo.
echo Starting server on http://localhost:3000...
echo Press Ctrl+C to stop the server
echo.

npm start
pause