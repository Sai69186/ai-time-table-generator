from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, validator
from typing import List, Optional, Dict
from services.timetable_service import TimetableService
from services.auth_service import verify_token, get_user_profile
from config.database import database
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api")
security = HTTPBearer()

# Pydantic models
class SectionCreate(BaseModel):
    name: str
    year: int = 1
    
    @validator('name')
    def validate_name(cls, v):
        if not v or len(v.strip()) < 1:
            raise ValueError('Section name is required')
        return v.strip()

class CourseCreate(BaseModel):
    name: str
    code: str
    teacher: str
    room: str = ""
    duration: int = 1
    color: str = "#3f51b5"
    section_id: int
    
    @validator('name', 'code', 'teacher')
    def validate_required_fields(cls, v):
        if not v or len(v.strip()) < 1:
            raise ValueError('This field is required')
        return v.strip()
    
    @validator('duration')
    def validate_duration(cls, v):
        if v < 1 or v > 8:
            raise ValueError('Duration must be between 1 and 8 hours')
        return v

class TimetableConfig(BaseModel):
    section_id: int
    start_time: str = "09:00"
    end_time: str = "16:00"
    period_duration: int = 50
    break_duration: int = 10
    lunch_start: str = "12:30"
    lunch_duration: int = 45
    working_days: List[str] = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]

def get_current_user_id(credentials: HTTPAuthorizationCredentials = Depends(security)):
    email = verify_token(credentials.credentials)
    if not email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )
    
    user = get_user_profile(email)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return user["id"]

# Section endpoints
@router.post("/sections")
async def create_section(
    section: SectionCreate,
    user_id: int = Depends(get_current_user_id)
):
    try:
        service = TimetableService(database)
        new_section = service.create_section(user_id, section.name, section.year)
        
        if not new_section:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Section with this name already exists"
            )
        
        return {
            "success": True,
            "data": {
                "id": new_section.id,
                "name": new_section.name,
                "year": new_section.year,
                "created_at": new_section.created_at.isoformat()
            }
        }
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        logger.error(f"Error creating section: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to create section")

@router.get("/sections")
async def get_sections(
    user_id: int = Depends(get_current_user_id)
):
    try:
        service = TimetableService(database)
        sections = service.get_user_sections(user_id)
        
        return {
            "success": True,
            "data": [
                {
                    "id": section.id,
                    "name": section.name,
                    "year": section.year,
                    "created_at": section.created_at.isoformat()
                }
                for section in sections
            ]
        }
    except Exception as e:
        logger.error(f"Error fetching sections: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to fetch sections")

@router.delete("/sections/{section_id}")
async def delete_section(
    section_id: int,
    user_id: int = Depends(get_current_user_id)
):
    try:
        service = TimetableService(database)
        success = service.delete_section(user_id, section_id)
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Section not found"
            )
        
        return {"success": True, "message": "Section deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting section: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to delete section")

# Course endpoints
@router.post("/courses")
async def create_course(
    course: CourseCreate,
    user_id: int = Depends(get_current_user_id)
):
    try:
        service = TimetableService(database)
        new_course = service.create_course(
            user_id=user_id,
            section_id=course.section_id,
            name=course.name,
            code=course.code,
            teacher=course.teacher,
            room=course.room,
            duration=course.duration,
            color=course.color
        )
        
        if not new_course:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Course with this code already exists in the section or section not found"
            )
        
        return {
            "success": True,
            "data": {
                "id": new_course.id,
                "name": new_course.name,
                "code": new_course.code,
                "teacher": new_course.teacher,
                "room": new_course.room,
                "duration": new_course.duration,
                "color": new_course.color,
                "section_id": new_course.section_id,
                "created_at": new_course.created_at.isoformat()
            }
        }
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating course: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to create course")

@router.get("/sections/{section_id}/courses")
async def get_section_courses(
    section_id: int,
    user_id: int = Depends(get_current_user_id)
):
    try:
        service = TimetableService(database)
        courses = service.get_section_courses(user_id, section_id)
        
        return {
            "success": True,
            "data": [
                {
                    "id": course.id,
                    "name": course.name,
                    "code": course.code,
                    "teacher": course.teacher,
                    "room": course.room,
                    "duration": course.duration,
                    "color": course.color,
                    "section_id": course.section_id,
                    "created_at": course.created_at.isoformat()
                }
                for course in courses
            ]
        }
    except Exception as e:
        logger.error(f"Error fetching courses: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to fetch courses")

@router.delete("/courses/{course_id}")
async def delete_course(
    course_id: int,
    user_id: int = Depends(get_current_user_id)
):
    try:
        service = TimetableService(database)
        success = service.delete_course(user_id, course_id)
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Course not found"
            )
        
        return {"success": True, "message": "Course deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting course: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to delete course")

# Timetable endpoints
@router.post("/timetables/generate")
async def generate_timetable(
    config: TimetableConfig,
    user_id: int = Depends(get_current_user_id)
):
    try:
        service = TimetableService(database)
        
        # Convert config to dict
        config_dict = {
            'start_time': config.start_time,
            'end_time': config.end_time,
            'period_duration': config.period_duration,
            'break_duration': config.break_duration,
            'lunch_start': config.lunch_start,
            'lunch_duration': config.lunch_duration,
            'working_days': config.working_days
        }
        
        timetable = service.generate_timetable(user_id, config.section_id, config_dict)
        
        if not timetable:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Section not found or no courses available"
            )
        
        return {
            "success": True,
            "data": {
                "id": timetable.id,
                "name": timetable.name,
                "section_id": timetable.section_id,
                "created_at": timetable.created_at.isoformat()
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating timetable: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to generate timetable")

@router.get("/sections/{section_id}/timetable")
async def get_timetable(
    section_id: int,
    user_id: int = Depends(get_current_user_id)
):
    try:
        service = TimetableService(database)
        timetable = service.get_timetable(user_id, section_id)
        
        if not timetable:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Timetable not found"
            )
        
        return {"success": True, "data": timetable}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching timetable: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to fetch timetable")

@router.delete("/timetables/{timetable_id}")
async def delete_timetable(
    timetable_id: int,
    user_id: int = Depends(get_current_user_id)
):
    try:
        service = TimetableService(database)
        success = service.delete_timetable(user_id, timetable_id)
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Timetable not found"
            )
        
        return {"success": True, "message": "Timetable deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting timetable: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to delete timetable")