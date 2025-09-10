@echo off
echo Starting Python Backend Server...
cd /d "c:\Users\vlpra\OneDrive\Desktop\mini project\python-backend"
start "Python Server" cmd /k "python main.py"
timeout /t 3
echo Opening test page...
start "" "c:\Users\vlpra\OneDrive\Desktop\mini project\test-auth-simple.html"
echo.
echo Server started! Test the authentication in the opened browser window.
echo Use: Email: test@test.com, Password: 123456
pause