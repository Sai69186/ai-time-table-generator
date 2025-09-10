from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import List, Optional
from services.auth_service import verify_token, get_user_profile
from config.sqlite_database import database
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
    department: str = "General"
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

# Public endpoints without authentication
@router.post("/sections/public")
async def create_section_public(section: SectionCreate):
    try:
        user_id = 1
        query = "INSERT INTO university_sections (name, year, semester, branch_id, strength, user_id) VALUES (?, ?, ?, ?, ?, ?)"
        section_id = database.execute_insert(query, (section.name, section.year, section.semester, section.branch_id, section.strength, user_id))
        return {"success": True, "data": {"id": section_id, "name": section.name, "year": section.year, "semester": section.semester, "strength": section.strength}}
    except Exception as e:
        logger.error(f"Error creating section: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to create section")

@router.post("/teachers/public")
async def create_teacher_public(teacher: TeacherCreate):
    try:
        user_id = 1
        query = "INSERT INTO teachers (name, employee_id, department, max_hours_per_day, user_id) VALUES (?, ?, ?, ?, ?)"
        teacher_id = database.execute_insert(query, (teacher.name, teacher.employee_id, teacher.department, teacher.max_hours_per_day, user_id))
        return {"success": True, "data": {"id": teacher_id, "name": teacher.name, "employee_id": teacher.employee_id, "department": teacher.department, "max_hours_per_day": teacher.max_hours_per_day}}
    except Exception as e:
        logger.error(f"Error creating teacher: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to create teacher")

@router.post("/subjects/public")
async def create_subject_public(subject: SubjectCreate):
    try:
        user_id = 1
        query = "INSERT INTO subjects (name, code, credits, subject_type, hours_per_week, user_id) VALUES (?, ?, ?, ?, ?, ?)"
        subject_id = database.execute_insert(query, (subject.name, subject.code, subject.credits, subject.subject_type, subject.hours_per_week, user_id))
        return {"success": True, "data": {"id": subject_id, "name": subject.name, "code": subject.code, "credits": subject.credits, "subject_type": subject.subject_type, "hours_per_week": subject.hours_per_week}}
    except Exception as e:
        logger.error(f"Error creating subject: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to create subject")

@router.post("/rooms/public")
async def create_room_public(room: RoomCreate):
    try:
        user_id = 1
        query = "INSERT INTO rooms (number, building, capacity, room_type, user_id) VALUES (?, ?, ?, ?, ?)"
        room_id = database.execute_insert(query, (room.number, room.building, room.capacity, room.room_type, user_id))
        return {"success": True, "data": {"id": room_id, "number": room.number, "building": room.building, "capacity": room.capacity, "room_type": room.room_type}}
    except Exception as e:
        logger.error(f"Error creating room: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to create room")

@router.post("/courses/public")
async def create_course_public(course: CourseCreate):
    try:
        user_id = 1
        query = "INSERT INTO courses (name, teacher, room, section_id, user_id) SELECT s.name, t.name, r.number, ?, ? FROM subjects s, teachers t, rooms r WHERE s.id = ? AND t.id = ? AND r.id = ?"
        course_id = database.execute_insert(query, (course.section_id, user_id, course.subject_id, course.teacher_id, course.room_id or 1))
        return {"success": True, "data": {"id": course_id, "section_id": course.section_id, "subject_id": course.subject_id, "teacher_id": course.teacher_id, "room_id": course.room_id}}
    except Exception as e:
        logger.error(f"Error creating course: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to create course")

@router.get("/sections/public")
async def get_sections_public():
    try:
        query = "SELECT * FROM university_sections ORDER BY year, semester, name"
        sections = database.execute_query(query)
        return {"success": True, "data": sections or []}
    except Exception as e:
        logger.error(f"Error fetching sections: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to fetch sections")

@router.get("/teachers/public")
async def get_teachers_public():
    try:
        query = "SELECT * FROM teachers ORDER BY name"
        teachers = database.execute_query(query)
        return {"success": True, "data": teachers or []}
    except Exception as e:
        logger.error(f"Error fetching teachers: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to fetch teachers")

@router.get("/subjects/public")
async def get_subjects_public():
    try:
        query = "SELECT * FROM subjects ORDER BY name"
        subjects = database.execute_query(query)
        return {"success": True, "data": subjects or []}
    except Exception as e:
        logger.error(f"Error fetching subjects: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to fetch subjects")

@router.get("/sections/{section_id}/courses/public")
async def get_section_courses_public(section_id: int):
    try:
        query = "SELECT * FROM courses WHERE section_id = ?"
        courses = database.execute_query(query, (section_id,))
        return {"success": True, "data": courses or []}
    except Exception as e:
        logger.error(f"Error fetching section courses: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to fetch section courses")

@router.post("/timetables/generate/public")
async def generate_timetable_public(config: TimetableConfig):
    try:
        query = "SELECT c.*, s.name as subject_name, s.code as subject_code, t.name as teacher_name, r.number as room_number FROM courses c LEFT JOIN subjects s ON c.name = s.name LEFT JOIN teachers t ON c.teacher = t.name LEFT JOIN rooms r ON c.room = r.number WHERE c.section_id = ?"
        courses = database.execute_query(query, (config.section_id,))
        
        if not courses:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No courses found for this section")
        
        time_slots = [
            {"slot_number": 1, "start_time": "09:00", "end_time": "09:50"},
            {"slot_number": 2, "start_time": "10:00", "end_time": "10:50"},
            {"slot_number": 3, "start_time": "11:00", "end_time": "11:50"},
            {"slot_number": 4, "start_time": "13:15", "end_time": "14:05"},
            {"slot_number": 5, "start_time": "14:15", "end_time": "15:05"},
            {"slot_number": 6, "start_time": "15:15", "end_time": "16:05"}
        ]
        
        timetable = {}
        for day in config.working_days:
            timetable[day] = {}
            for i, slot in enumerate(time_slots):
                if i < len(courses):
                    course = courses[i % len(courses)]
                    timetable[day][slot["slot_number"]] = {
                        "time": f"{slot['start_time']}-{slot['end_time']}",
                        "subject": course.get('subject_name', course.get('name', 'Unknown')),
                        "subject_code": course.get('subject_code', 'N/A'),
                        "teacher": course.get('teacher_name', course.get('teacher', 'TBA')),
                        "room": course.get('room_number', course.get('room', 'TBA')),
                        "type": "class"
                    }
                else:
                    timetable[day][slot["slot_number"]] = {
                        "time": f"{slot['start_time']}-{slot['end_time']}",
                        "subject": None,
                        "teacher": None,
                        "room": None,
                        "type": "free"
                    }
        
        return {
            "success": True,
            "data": {
                "section_id": config.section_id,
                "timetable": timetable,
                "time_slots": time_slots,
                "working_days": config.working_days,
                "total_courses": len(courses)
            }
        }
    except Exception as e:
        logger.error(f"Error generating timetable: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to generate timetable")