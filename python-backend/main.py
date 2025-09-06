from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from routes.auth import router as auth_router
from routes.university_timetable import router as university_router
import os
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="AI Timetable Generator API",
    version="1.0.0",
    description="Complete backend API for AI-powered timetable generation"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Global exception: {exc}")
    return JSONResponse(
        status_code=500,
        content={"success": False, "message": "Internal server error"}
    )

# Include routers
app.include_router(auth_router)
app.include_router(university_router)

# Serve static files from parent directory
try:
    app.mount("/static", StaticFiles(directory="../"), name="static")
except Exception as e:
    logger.warning(f"Could not mount static files: {e}")

@app.get("/")
async def read_root():
    try:
        return FileResponse("../index.html")
    except FileNotFoundError:
        return JSONResponse(
            content={"message": "Welcome to AI Timetable Generator API", "docs": "/docs"}
        )

@app.on_event("startup")
async def startup_event():
    logger.info("AI Timetable Generator API started successfully")
    logger.info("API Documentation available at: http://localhost:3000/docs")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="127.0.0.1",
        port=3000,
        reload=True,
        log_level="info"
    )