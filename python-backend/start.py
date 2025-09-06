#!/usr/bin/env python3
"""
Startup script for AI Timetable Generator Backend
"""
import uvicorn
import logging
import sys
import os

# Add the current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger(__name__)

def main():
    """Start the FastAPI server"""
    try:
        logger.info("Starting AI Timetable Generator Backend...")
        logger.info("Server will be available at: http://localhost:3000")
        logger.info("API Documentation: http://localhost:3000/docs")
        logger.info("Press Ctrl+C to stop the server")
        
        uvicorn.run(
            "main:app",
            host="127.0.0.1",
            port=3000,
            reload=True,
            log_level="info",
            access_log=True
        )
    except KeyboardInterrupt:
        logger.info("Server stopped by user")
    except Exception as e:
        logger.error(f"Failed to start server: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()