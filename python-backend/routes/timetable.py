from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import List, Optional
from routes.auth import get_current_user, security
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api")

class Section(BaseModel):
    name: str
    
class Course(BaseModel):
    name: str
    teacher: str
    room: str
    section_id: int

class Teacher(BaseModel):
    name: str
    email: Optional[str] = None

@router.get("/sections")
async def get_sections(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        email = get_current_user(credentials)
        return {"success": True, "data": []}
    except Exception as e:
        logger.error(f"Error fetching sections: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch sections")

@router.post("/sections")
async def create_section(section: Section, credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        email = get_current_user(credentials)
        return {"success": True, "data": {"id": 1, "name": section.name}}
    except Exception as e:
        logger.error(f"Error creating section: {e}")
        raise HTTPException(status_code=500, detail="Failed to create section")

@router.get("/university/teachers")
async def get_teachers():
    try:
        return {"success": True, "data": []}
    except Exception as e:
        logger.error(f"Error fetching teachers: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch teachers")

@router.get("/courses")
async def get_courses(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        email = get_current_user(credentials)
        return {"success": True, "data": []}
    except Exception as e:
        logger.error(f"Error fetching courses: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch courses")

@router.post("/courses")
async def create_course(course: Course, credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        email = get_current_user(credentials)
        return {"success": True, "data": {"id": 1, **course.dict()}}
    except Exception as e:
        logger.error(f"Error creating course: {e}")
        raise HTTPException(status_code=500, detail="Failed to create course")