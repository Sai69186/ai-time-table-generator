from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from routes.auth import router as auth_router
from routes.university_timetable_fixed import router as university_router
try:
    from routes.timetable import router as timetable_router
except ImportError:
    timetable_router = None
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
app.include_router(timetable_router)

# Add missing sections endpoint for compatibility
@app.get("/api/sections")
async def get_sections_compat():
    return JSONResponse(content={"success": True, "data": []})

@app.post("/api/sections")
async def create_section_compat():
    return JSONResponse(content={"success": True, "data": {"id": 1, "name": "Sample"}})

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

@app.get("/api/health")
async def health_check():
    from config.sqlite_database import database
    db_status = "connected" if database.connection else "disconnected"
    return JSONResponse(
        content={
            "status": "OK",
            "message": "AI Timetable Generator API is running",
            "database": db_status,
            "endpoints": [
                "/api/login",
                "/api/register", 
                "/api/university/branches",
                "/api/university/sections",
                "/api/university/teachers",
                "/api/university/rooms",
                "/api/university/subjects",
                "/api/university/courses"
            ]
        }
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