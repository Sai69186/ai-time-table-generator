import uvicorn
import sys
import os

# Add the current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

if __name__ == "__main__":
    print("Starting AI Timetable Generator Backend...")
    print("Server will be available at: http://localhost:3000")
    print("API Documentation at: http://localhost:3000/docs")
    print("Press Ctrl+C to stop the server")
    
    uvicorn.run(
        "main:app",
        host="127.0.0.1",
        port=3000,
        reload=True,
        log_level="info"
    )