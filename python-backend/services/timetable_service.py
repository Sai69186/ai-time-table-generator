from sqlalchemy.orm import Session
from models.university import Section, Course, Timetable, TimetableSlot
from models.user import User
from datetime import datetime, time, timedelta
import random
from typing import List, Dict, Optional

class TimetableService:
    def __init__(self, db: Session):
        self.db = db
    
    def create_section(self, user_id: int, name: str, year: int) -> Optional[Section]:
        # Check if section already exists for this user
        existing = self.db.query(Section).filter(
            Section.user_id == user_id,
            Section.name == name
        ).first()
        
        if existing:
            return None
        
        section = Section(name=name, year=year, user_id=user_id)
        self.db.add(section)
        self.db.commit()
        self.db.refresh(section)
        return section
    
    def get_user_sections(self, user_id: int) -> List[Section]:
        return self.db.query(Section).filter(Section.user_id == user_id).all()
    
    def delete_section(self, user_id: int, section_id: int) -> bool:
        section = self.db.query(Section).filter(
            Section.id == section_id,
            Section.user_id == user_id
        ).first()
        
        if section:
            self.db.delete(section)
            self.db.commit()
            return True
        return False
    
    def create_course(self, user_id: int, section_id: int, name: str, code: str, 
                     teacher: str, room: str = "", duration: int = 1, color: str = "#3f51b5") -> Optional[Course]:
        # Verify section belongs to user
        section = self.db.query(Section).filter(
            Section.id == section_id,
            Section.user_id == user_id
        ).first()
        
        if not section:
            return None
        
        # Check if course code already exists for this section
        existing = self.db.query(Course).filter(
            Course.section_id == section_id,
            Course.code == code
        ).first()
        
        if existing:
            return None
        
        course = Course(
            name=name,
            code=code,
            teacher=teacher,
            room=room,
            duration=duration,
            color=color,
            section_id=section_id,
            user_id=user_id
        )
        
        self.db.add(course)
        self.db.commit()
        self.db.refresh(course)
        return course
    
    def get_section_courses(self, user_id: int, section_id: int) -> List[Course]:
        return self.db.query(Course).filter(
            Course.section_id == section_id,
            Course.user_id == user_id
        ).all()
    
    def delete_course(self, user_id: int, course_id: int) -> bool:
        course = self.db.query(Course).filter(
            Course.id == course_id,
            Course.user_id == user_id
        ).first()
        
        if course:
            self.db.delete(course)
            self.db.commit()
            return True
        return False
    
    def generate_timetable(self, user_id: int, section_id: int, config: Dict) -> Optional[Timetable]:
        # Verify section belongs to user
        section = self.db.query(Section).filter(
            Section.id == section_id,
            Section.user_id == user_id
        ).first()
        
        if not section:
            return None
        
        # Get courses for this section
        courses = self.get_section_courses(user_id, section_id)
        if not courses:
            return None
        
        # Parse configuration
        start_time = self._parse_time(config.get('start_time', '09:00'))
        end_time = self._parse_time(config.get('end_time', '16:00'))
        period_duration = config.get('period_duration', 50)
        break_duration = config.get('break_duration', 10)
        lunch_start = self._parse_time(config.get('lunch_start', '12:30'))
        lunch_duration = config.get('lunch_duration', 45)
        working_days = config.get('working_days', ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'])
        
        # Create timetable
        timetable = Timetable(
            name=f"{section.name} Timetable",
            section_id=section_id,
            user_id=user_id,
            start_time=start_time,
            end_time=end_time,
            period_duration=period_duration,
            break_duration=break_duration,
            lunch_start=lunch_start,
            lunch_duration=lunch_duration,
            working_days=','.join(working_days)
        )
        
        self.db.add(timetable)
        self.db.commit()
        self.db.refresh(timetable)
        
        # Generate time slots
        self._generate_time_slots(timetable, courses, working_days)
        
        return timetable
    
    def _parse_time(self, time_str: str) -> time:
        try:
            return datetime.strptime(time_str, '%H:%M').time()
        except:
            return datetime.strptime('09:00', '%H:%M').time()
    
    def _generate_time_slots(self, timetable: Timetable, courses: List[Course], working_days: List[str]):
        # Calculate available time slots
        current_time = datetime.combine(datetime.today(), timetable.start_time)
        end_time = datetime.combine(datetime.today(), timetable.end_time)
        lunch_start = datetime.combine(datetime.today(), timetable.lunch_start)
        
        # Create course pool with repetitions based on duration
        course_pool = []
        for course in courses:
            for _ in range(course.duration * len(working_days)):
                course_pool.append(course)
        
        random.shuffle(course_pool)
        course_index = 0
        
        for day in working_days:
            day_start = current_time.replace(hour=timetable.start_time.hour, minute=timetable.start_time.minute)
            current_slot = day_start
            
            while current_slot < end_time and course_index < len(course_pool):
                # Check for lunch break
                if (current_slot.time() <= timetable.lunch_start <= 
                    (current_slot + timedelta(minutes=timetable.period_duration)).time()):
                    
                    # Add lunch break
                    lunch_end = lunch_start + timedelta(minutes=timetable.lunch_duration)
                    lunch_slot = TimetableSlot(
                        timetable_id=timetable.id,
                        course_id=course_pool[0].id,  # Dummy course for break
                        day=day,
                        start_time=lunch_start.time(),
                        end_time=lunch_end.time(),
                        is_break=True,
                        break_type='lunch'
                    )
                    self.db.add(lunch_slot)
                    current_slot = lunch_end
                    continue
                
                # Add course slot
                if course_index < len(course_pool):
                    course = course_pool[course_index]
                    slot_end = current_slot + timedelta(minutes=timetable.period_duration)
                    
                    course_slot = TimetableSlot(
                        timetable_id=timetable.id,
                        course_id=course.id,
                        day=day,
                        start_time=current_slot.time(),
                        end_time=slot_end.time(),
                        is_break=False
                    )
                    self.db.add(course_slot)
                    
                    current_slot = slot_end + timedelta(minutes=timetable.break_duration)
                    course_index += 1
                else:
                    break
        
        self.db.commit()
    
    def get_timetable(self, user_id: int, section_id: int) -> Optional[Dict]:
        timetable = self.db.query(Timetable).filter(
            Timetable.section_id == section_id,
            Timetable.user_id == user_id
        ).first()
        
        if not timetable:
            return None
        
        slots = self.db.query(TimetableSlot).filter(
            TimetableSlot.timetable_id == timetable.id
        ).all()
        
        # Organize slots by day
        timetable_data = {
            'id': timetable.id,
            'name': timetable.name,
            'section_id': timetable.section_id,
            'working_days': timetable.working_days.split(','),
            'slots': {}
        }
        
        for slot in slots:
            if slot.day not in timetable_data['slots']:
                timetable_data['slots'][slot.day] = []
            
            slot_data = {
                'id': slot.id,
                'start_time': slot.start_time.strftime('%H:%M'),
                'end_time': slot.end_time.strftime('%H:%M'),
                'is_break': slot.is_break,
                'break_type': slot.break_type
            }
            
            if not slot.is_break:
                course = self.db.query(Course).filter(Course.id == slot.course_id).first()
                if course:
                    slot_data.update({
                        'course_name': course.name,
                        'course_code': course.code,
                        'teacher': course.teacher,
                        'room': course.room,
                        'color': course.color
                    })
            
            timetable_data['slots'][slot.day].append(slot_data)
        
        return timetable_data
    
    def delete_timetable(self, user_id: int, timetable_id: int) -> bool:
        timetable = self.db.query(Timetable).filter(
            Timetable.id == timetable_id,
            Timetable.user_id == user_id
        ).first()
        
        if timetable:
            self.db.delete(timetable)
            self.db.commit()
            return True
        return False