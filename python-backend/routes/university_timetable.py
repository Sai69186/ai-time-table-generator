from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, validator
from typing import List, Optional
from services.auth_service import verify_token, get_user_profile
from config.database import database
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/university")
security = HTTPBearer()

# Pydantic models
class BranchCreate(BaseModel):
    name: str
    code: str

class SectionCreate(BaseModel):
    name: str
    year: int
    semester: int
    branch_id: int
    strength: int = 60

class TeacherCreate(BaseModel):
    name: str
    employee_id: str
    department: str
    max_hours_per_day: int = 6

class RoomCreate(BaseModel):
    number: str
    building: str
    capacity: int = 60
    room_type: str = "classroom"

class SubjectCreate(BaseModel):
    name: str
    code: str
    credits: int = 3
    subject_type: str = "theory"
    hours_per_week: int = 3

class CourseCreate(BaseModel):
    section_id: int
    subject_id: int
    teacher_id: int
    room_id: Optional[int] = None

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

# Branch endpoints
@router.post("/branches")
async def create_branch(
    branch: BranchCreate,
    user_id: int = Depends(get_current_user_id)
):
    try:
        query = "INSERT INTO branches (name, code, user_id) VALUES (%s, %s, %s)"
        branch_id = database.execute_insert(query, (branch.name, branch.code, user_id))
        
        if not branch_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Branch with this code already exists"
            )
        
        return {
            "success": True,
            "data": {
                "id": branch_id,
                "name": branch.name,
                "code": branch.code
            }
        }
    except Exception as e:
        logger.error(f"Error creating branch: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to create branch")

# Section endpoints
@router.post("/sections")
async def create_section(
    section: SectionCreate,
    user_id: int = Depends(get_current_user_id)
):
    try:
        query = "INSERT INTO university_sections (name, year, semester, branch_id, strength, user_id) VALUES (%s, %s, %s, %s, %s, %s)"
        section_id = database.execute_insert(query, (section.name, section.year, section.semester, section.branch_id, section.strength, user_id))
        
        if not section_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Section already exists"
            )
        
        return {
            "success": True,
            "data": {
                "id": section_id,
                "name": section.name,
                "year": section.year,
                "semester": section.semester,
                "strength": section.strength
            }
        }
    except Exception as e:
        logger.error(f"Error creating section: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to create section")

# Teacher endpoints
@router.post("/teachers")
async def create_teacher(
    teacher: TeacherCreate,
    user_id: int = Depends(get_current_user_id)
):
    try:
        query = "INSERT INTO teachers (name, employee_id, department, max_hours_per_day, user_id) VALUES (%s, %s, %s, %s, %s)"
        teacher_id = database.execute_insert(query, (teacher.name, teacher.employee_id, teacher.department, teacher.max_hours_per_day, user_id))
        
        if not teacher_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Teacher with this employee ID already exists"
            )
        
        return {
            "success": True,
            "data": {
                "id": teacher_id,
                "name": teacher.name,
                "employee_id": teacher.employee_id,
                "department": teacher.department,
                "max_hours_per_day": teacher.max_hours_per_day
            }
        }
    except Exception as e:
        logger.error(f"Error creating teacher: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to create teacher")

# Room endpoints
@router.post("/rooms")
async def create_room(
    room: RoomCreate,
    user_id: int = Depends(get_current_user_id)
):
    try:
        query = "INSERT INTO rooms (number, building, capacity, room_type, user_id) VALUES (%s, %s, %s, %s, %s)"
        room_id = database.execute_insert(query, (room.number, room.building, room.capacity, room.room_type, user_id))
        
        if not room_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Room already exists in this building"
            )
        
        return {
            "success": True,
            "data": {
                "id": room_id,
                "number": room.number,
                "building": room.building,
                "capacity": room.capacity,
                "room_type": room.room_type
            }
        }
    except Exception as e:
        logger.error(f"Error creating room: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to create room")

# Subject endpoints
@router.post("/subjects")
async def create_subject(
    subject: SubjectCreate,
    user_id: int = Depends(get_current_user_id)
):
    try:
        query = "INSERT INTO subjects (name, code, credits, subject_type, hours_per_week, user_id) VALUES (%s, %s, %s, %s, %s, %s)"
        subject_id = database.execute_insert(query, (subject.name, subject.code, subject.credits, subject.subject_type, subject.hours_per_week, user_id))
        
        if not subject_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Subject with this code already exists"
            )
        
        return {
            "success": True,
            "data": {
                "id": subject_id,
                "name": subject.name,
                "code": subject.code,
                "credits": subject.credits,
                "subject_type": subject.subject_type,
                "hours_per_week": subject.hours_per_week
            }
        }
    except Exception as e:
        logger.error(f"Error creating subject: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to create subject")

# Course endpoints
@router.post("/courses")
async def create_course(
    course: CourseCreate,
    user_id: int = Depends(get_current_user_id)
):
    try:
        # Create a simple course mapping - using existing courses table structure
        query = "INSERT INTO courses (name, teacher, room, section_id, user_id) SELECT s.name, t.name, r.number, %s, %s FROM subjects s, teachers t, rooms r WHERE s.id = %s AND t.id = %s AND r.id = %s"
        course_id = database.execute_insert(query, (course.section_id, user_id, course.subject_id, course.teacher_id, course.room_id or 1))
        
        if not course_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Course already exists or invalid references"
            )
        
        return {
            "success": True,
            "data": {
                "id": course_id,
                "section_id": course.section_id,
                "subject_id": course.subject_id,
                "teacher_id": course.teacher_id,
                "room_id": course.room_id
            }
        }
    except Exception as e:
        logger.error(f"Error creating course: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to create course")

# Timetable endpoints
@router.post("/timetables/generate")
async def generate_university_timetable(
    config: TimetableConfig,
    user_id: int = Depends(get_current_user_id)
):
    try:
        # Simple timetable generation - get courses for section
        query = "SELECT * FROM courses WHERE section_id = %s AND user_id = %s"
        courses = database.execute_query(query, (config.section_id, user_id))
        
        if not courses:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No courses found for this section"
            )
        
        # Generate basic timetable structure
        timetable_data = {
            "section_id": config.section_id,
            "courses": courses,
            "config": {
                "start_time": config.start_time,
                "end_time": config.end_time,
                "working_days": config.working_days
            }
        }
        
        return {
            "success": True,
            "data": timetable_data
        }
    except Exception as e:
        logger.error(f"Error generating timetable: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to generate timetable")

@router.get("/sections/{section_id}/timetable")
async def get_university_timetable(
    section_id: int,
    user_id: int = Depends(get_current_user_id)
):
    try:
        query = "SELECT * FROM courses WHERE section_id = %s AND user_id = %s"
        courses = database.execute_query(query, (section_id, user_id))
        
        if not courses:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No courses found for this section"
            )
        
        return {"success": True, "data": {"courses": courses}}
    except Exception as e:
        logger.error(f"Error fetching timetable: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to fetch timetable")