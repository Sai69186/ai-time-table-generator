from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, validator
from typing import List, Optional
from services.auth_service import verify_token, get_user_profile
from config.sqlite_database import database
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
    department: str = "General"  # Make optional with default
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
        query = "INSERT INTO branches (name, code, user_id) VALUES (?, ?, ?)"
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
        query = "INSERT INTO university_sections (name, year, semester, branch_id, strength, user_id) VALUES (?, ?, ?, ?, ?, ?)"
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
        query = "INSERT INTO teachers (name, employee_id, department, max_hours_per_day, user_id) VALUES (?, ?, ?, ?, ?)"
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

# Public endpoints without authentication
@router.post("/branches/public")
async def create_branch_public(branch: BranchCreate):
    try:
        user_id = 1
        query = "INSERT INTO branches (name, code, user_id) VALUES (?, ?, ?)"
        branch_id = database.execute_insert(query, (branch.name, branch.code, user_id))
        return {"success": True, "data": {"id": branch_id, "name": branch.name, "code": branch.code}}
    except Exception as e:
        logger.error(f"Error creating branch: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to create branch")

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

# Public GET endpoints
@router.get("/branches/public")
async def get_branches_public():
    try:
        query = "SELECT * FROM branches ORDER BY name"
        branches = database.execute_query(query)
        return {"success": True, "data": branches or []}
    except Exception as e:
        logger.error(f"Error fetching branches: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to fetch branches")

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

@router.get("/rooms/public")
async def get_rooms_public():
    try:
        query = "SELECT * FROM rooms ORDER BY building, number"
        rooms = database.execute_query(query)
        return {"success": True, "data": rooms or []}
    except Exception as e:
        logger.error(f"Error fetching rooms: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to fetch rooms")

@router.get("/subjects/public")
async def get_subjects_public():
    try:
        query = "SELECT * FROM subjects ORDER BY name"
        subjects = database.execute_query(query)
        return {"success": True, "data": subjects or []}
    except Exception as e:
        logger.error(f"Error fetching subjects: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to fetch subjects")

@router.get("/courses/public")
async def get_courses_public():
    try:
        query = "SELECT * FROM courses ORDER BY section_id"
        courses = database.execute_query(query)
        return {"success": True, "data": courses or []}
    except Exception as e:
        logger.error(f"Error fetching courses: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to fetch courses")

@router.get("/sections/{section_id}/courses/public")
async def get_section_courses_public(section_id: int):
    try:
        query = "SELECT * FROM courses WHERE section_id = ?"
        courses = database.execute_query(query, (section_id,))
        return {"success": True, "data": courses or []}
    except Exception as e:
        logger.error(f"Error fetching section courses: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to fetch section courses")

# Room endpoints
@router.post("/rooms")
async def create_room(
    room: RoomCreate,
    user_id: int = Depends(get_current_user_id)
):
    try:
        query = "INSERT INTO rooms (number, building, capacity, room_type, user_id) VALUES (?, ?, ?, ?, ?)"
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
        query = "INSERT INTO subjects (name, code, credits, subject_type, hours_per_week, user_id) VALUES (?, ?, ?, ?, ?, ?)"
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
        query = "INSERT INTO courses (name, teacher, room, section_id, user_id) SELECT s.name, t.name, r.number, ?, ? FROM subjects s, teachers t, rooms r WHERE s.id = ? AND t.id = ? AND r.id = ?"
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

@router.post("/timetables/generate/public")
async def generate_university_timetable_public(config: TimetableConfig):
    try:
        # Get courses for section
        query = "SELECT c.*, s.name as subject_name, s.code as subject_code, t.name as teacher_name, r.number as room_number, r.building FROM courses c LEFT JOIN subjects s ON c.name = s.name LEFT JOIN teachers t ON c.teacher = t.name LEFT JOIN rooms r ON c.room = r.number WHERE c.section_id = ?"
        courses = database.execute_query(query, (config.section_id,))
        
        if not courses:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No courses found for this section"
            )
        
        # Generate time slots
        time_slots = generate_time_slots(config.start_time, config.end_time, config.period_duration, config.lunch_start, config.lunch_duration)
        
        # Generate timetable with proper logic
        timetable = generate_smart_timetable(courses, time_slots, config.working_days)
        
        return {
            "success": True,
            "data": {
                "section_id": config.section_id,
                "timetable": timetable,
                "time_slots": time_slots,
                "working_days": config.working_days,
                "total_courses": len(courses),
                "conflicts": detect_conflicts(timetable)
            }
        }
    except Exception as e:
        logger.error(f"Error generating timetable: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to generate timetable")

def generate_time_slots(start_time: str, end_time: str, period_duration: int, lunch_start: str, lunch_duration: int):
    slots = []
    start_minutes = time_to_minutes(start_time)
    end_minutes = time_to_minutes(end_time)
    lunch_start_minutes = time_to_minutes(lunch_start)
    lunch_end_minutes = lunch_start_minutes + lunch_duration
    
    current = start_minutes
    slot_num = 1
    
    while current + period_duration <= end_minutes:
        slot_end = current + period_duration
        
        # Skip lunch time
        if not (current >= lunch_start_minutes and current < lunch_end_minutes):
            slots.append({
                "slot_number": slot_num,
                "start_time": minutes_to_time(current),
                "end_time": minutes_to_time(slot_end),
                "duration": period_duration
            })
            slot_num += 1
        
        current = slot_end + 10  # 10 minute break
        
        # Jump over lunch break
        if current >= lunch_start_minutes and current < lunch_end_minutes:
            current = lunch_end_minutes
    
    return slots

def generate_smart_timetable(courses, time_slots, working_days):
    timetable = {}
    course_schedule = {}  # Track when each course is scheduled
    teacher_schedule = {}  # Track teacher availability
    room_schedule = {}  # Track room availability
    
    # Initialize timetable structure
    for day in working_days:
        timetable[day] = {}
        for slot in time_slots:
            timetable[day][slot["slot_number"]] = {
                "time": f"{slot['start_time']}-{slot['end_time']}",
                "subject": None,
                "teacher": None,
                "room": None,
                "type": "free"
            }
    
    # Distribute courses across days and time slots
    course_index = 0
    for day in working_days:
        for slot in time_slots:
            if course_index < len(courses):
                course = courses[course_index % len(courses)]
                slot_key = slot["slot_number"]
                
                # Check for conflicts
                teacher_key = f"{day}-{slot_key}"
                room_key = f"{day}-{slot_key}"
                
                if (teacher_key not in teacher_schedule.get(course.get('teacher', ''), []) and 
                    room_key not in room_schedule.get(course.get('room', ''), [])):
                    
                    # Assign course to slot
                    timetable[day][slot_key] = {
                        "time": f"{slot['start_time']}-{slot['end_time']}",
                        "subject": course.get('subject_name', course.get('name', 'Unknown')),
                        "subject_code": course.get('subject_code', 'N/A'),
                        "teacher": course.get('teacher_name', course.get('teacher', 'TBA')),
                        "room": f"{course.get('room_number', course.get('room', 'TBA'))} - {course.get('building', '')}".strip(' - '),
                        "type": "class",
                        "course_id": course.get('id')
                    }
                    
                    # Track schedules
                    teacher_name = course.get('teacher_name', course.get('teacher', ''))
                    room_name = course.get('room_number', course.get('room', ''))
                    
                    if teacher_name:
                        if teacher_name not in teacher_schedule:
                            teacher_schedule[teacher_name] = []
                        teacher_schedule[teacher_name].append(teacher_key)
                    
                    if room_name:
                        if room_name not in room_schedule:
                            room_schedule[room_name] = []
                        room_schedule[room_name].append(room_key)
                    
                    course_index += 1
    
    return timetable

def detect_conflicts(timetable):
    conflicts = []
    teacher_slots = {}
    room_slots = {}
    
    for day, slots in timetable.items():
        for slot_num, slot_data in slots.items():
            if slot_data["type"] == "class":
                teacher = slot_data["teacher"]
                room = slot_data["room"]
                time_key = f"{day}-{slot_num}"
                
                # Check teacher conflicts
                if teacher and teacher != "TBA":
                    if teacher in teacher_slots:
                        if time_key in teacher_slots[teacher]:
                            conflicts.append({
                                "type": "teacher",
                                "teacher": teacher,
                                "time": slot_data["time"],
                                "day": day
                            })
                        else:
                            teacher_slots[teacher].append(time_key)
                    else:
                        teacher_slots[teacher] = [time_key]
                
                # Check room conflicts
                if room and room != "TBA":
                    if room in room_slots:
                        if time_key in room_slots[room]:
                            conflicts.append({
                                "type": "room",
                                "room": room,
                                "time": slot_data["time"],
                                "day": day
                            })
                        else:
                            room_slots[room].append(time_key)
                    else:
                        room_slots[room] = [time_key]
    
    return conflicts

def time_to_minutes(time_str: str) -> int:
    hours, minutes = map(int, time_str.split(':'))
    return hours * 60 + minutes

def minutes_to_time(minutes: int) -> str:
    hours = minutes // 60
    mins = minutes % 60
    return f"{hours:02d}:{mins:02d}"

@router.get("/sections/{section_id}/timetable")
async def get_university_timetable(
    section_id: int,
    user_id: int = Depends(get_current_user_id)
):
    try:
        query = "SELECT * FROM courses WHERE section_id = ? AND user_id = ?"
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

# GET endpoints for fetching data
@router.get("/branches")
async def get_branches(user_id: int = Depends(get_current_user_id)):
    try:
        query = "SELECT * FROM branches WHERE user_id = ? ORDER BY name"
        branches = database.execute_query(query, (user_id,))
        return {"success": True, "data": branches or []}
    except Exception as e:
        logger.error(f"Error fetching branches: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to fetch branches")

@router.get("/sections")
async def get_sections(user_id: int = Depends(get_current_user_id)):
    try:
        query = "SELECT * FROM university_sections WHERE user_id = ? ORDER BY year, semester, name"
        sections = database.execute_query(query, (user_id,))
        return {"success": True, "data": sections or []}
    except Exception as e:
        logger.error(f"Error fetching sections: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to fetch sections")

@router.get("/teachers")
async def get_teachers(user_id: int = Depends(get_current_user_id)):
    try:
        query = "SELECT * FROM teachers WHERE user_id = ? ORDER BY name"
        teachers = database.execute_query(query, (user_id,))
        return {"success": True, "data": teachers or []}
    except Exception as e:
        logger.error(f"Error fetching teachers: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to fetch teachers")

@router.get("/rooms")
async def get_rooms(user_id: int = Depends(get_current_user_id)):
    try:
        query = "SELECT * FROM rooms WHERE user_id = ? ORDER BY building, number"
        rooms = database.execute_query(query, (user_id,))
        return {"success": True, "data": rooms or []}
    except Exception as e:
        logger.error(f"Error fetching rooms: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to fetch rooms")

@router.get("/subjects")
async def get_subjects(user_id: int = Depends(get_current_user_id)):
    try:
        query = "SELECT * FROM subjects WHERE user_id = ? ORDER BY name"
        subjects = database.execute_query(query, (user_id,))
        return {"success": True, "data": subjects or []}
    except Exception as e:
        logger.error(f"Error fetching subjects: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to fetch subjects")

@router.get("/courses")
async def get_courses(user_id: int = Depends(get_current_user_id)):
    try:
        query = "SELECT * FROM courses WHERE user_id = ? ORDER BY section_id"
        courses = database.execute_query(query, (user_id,))
        return {"success": True, "data": courses or []}
    except Exception as e:
        logger.error(f"Error fetching courses: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to fetch courses")