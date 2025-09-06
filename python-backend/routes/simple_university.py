from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import List
from services.auth_service import verify_token, get_user_profile
from config.database import database
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/university")
security = HTTPBearer()

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

@router.get("/branches")
async def get_branches(user_id: int = Depends(get_current_user_id)):
    try:
        query = "SELECT * FROM branches WHERE user_id = %s"
        branches = database.execute_query(query, (user_id,))
        
        return {
            "success": True,
            "data": branches or []
        }
    except Exception as e:
        logger.error(f"Error fetching branches: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to fetch branches")

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
                detail="Failed to create section"
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