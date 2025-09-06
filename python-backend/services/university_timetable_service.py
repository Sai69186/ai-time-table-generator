from sqlalchemy.orm import Session
from models.university import Branch, Section, Teacher, Room, Subject, Course, Timetable, TimetableSlot
from datetime import datetime, time, timedelta
import random
from typing import List, Dict, Optional, Tuple

class UniversityTimetableService:
    def __init__(self, db: Session):
        self.db = db
        self.conflicts = []
    
    def create_branch(self, user_id: int, name: str, code: str) -> Optional[Branch]:
        existing = self.db.query(Branch).filter(
            Branch.user_id == user_id,
            Branch.code == code
        ).first()
        
        if existing:
            return None
        
        branch = Branch(name=name, code=code, user_id=user_id)
        self.db.add(branch)
        self.db.commit()
        self.db.refresh(branch)
        return branch
    
    def create_section(self, user_id: int, name: str, year: int, semester: int, 
                      branch_id: int, strength: int = 60) -> Optional[Section]:
        existing = self.db.query(Section).filter(
            Section.user_id == user_id,
            Section.name == name,
            Section.year == year,
            Section.semester == semester,
            Section.branch_id == branch_id
        ).first()
        
        if existing:
            return None
        
        section = Section(
            name=name, year=year, semester=semester,
            branch_id=branch_id, strength=strength, user_id=user_id
        )
        self.db.add(section)
        self.db.commit()
        self.db.refresh(section)
        return section
    
    def create_teacher(self, user_id: int, name: str, employee_id: str, 
                      department: str, max_hours_per_day: int = 6) -> Optional[Teacher]:
        existing = self.db.query(Teacher).filter(
            Teacher.employee_id == employee_id
        ).first()
        
        if existing:
            return None
        
        teacher = Teacher(
            name=name, employee_id=employee_id, department=department,
            max_hours_per_day=max_hours_per_day, user_id=user_id
        )
        self.db.add(teacher)
        self.db.commit()
        self.db.refresh(teacher)
        return teacher
    
    def create_room(self, user_id: int, number: str, building: str, 
                   capacity: int = 60, room_type: str = "classroom") -> Optional[Room]:
        existing = self.db.query(Room).filter(
            Room.number == number,
            Room.building == building,
            Room.user_id == user_id
        ).first()
        
        if existing:
            return None
        
        room = Room(
            number=number, building=building, capacity=capacity,
            room_type=room_type, user_id=user_id
        )
        self.db.add(room)
        self.db.commit()
        self.db.refresh(room)
        return room
    
    def create_subject(self, user_id: int, name: str, code: str, credits: int = 3,
                      subject_type: str = "theory", hours_per_week: int = 3) -> Optional[Subject]:
        existing = self.db.query(Subject).filter(
            Subject.code == code,
            Subject.user_id == user_id
        ).first()
        
        if existing:
            return None
        
        subject = Subject(
            name=name, code=code, credits=credits,
            subject_type=subject_type, hours_per_week=hours_per_week, user_id=user_id
        )
        self.db.add(subject)
        self.db.commit()
        self.db.refresh(subject)
        return subject
    
    def create_course(self, user_id: int, section_id: int, subject_id: int,
                     teacher_id: int, room_id: int = None) -> Optional[Course]:
        # Verify all entities belong to user
        section = self.db.query(Section).filter(
            Section.id == section_id, Section.user_id == user_id
        ).first()
        subject = self.db.query(Subject).filter(
            Subject.id == subject_id, Subject.user_id == user_id
        ).first()
        teacher = self.db.query(Teacher).filter(
            Teacher.id == teacher_id, Teacher.user_id == user_id
        ).first()
        
        if not all([section, subject, teacher]):
            return None
        
        # Check for duplicate course
        existing = self.db.query(Course).filter(
            Course.section_id == section_id,
            Course.subject_id == subject_id
        ).first()
        
        if existing:
            return None
        
        course = Course(
            section_id=section_id, subject_id=subject_id,
            teacher_id=teacher_id, room_id=room_id, user_id=user_id
        )
        self.db.add(course)
        self.db.commit()
        self.db.refresh(course)
        return course
    
    def generate_university_timetable(self, user_id: int, section_id: int, config: Dict) -> Optional[Timetable]:
        section = self.db.query(Section).filter(
            Section.id == section_id, Section.user_id == user_id
        ).first()
        
        if not section:
            return None
        
        courses = self.db.query(Course).filter(
            Course.section_id == section_id, Course.user_id == user_id
        ).all()
        
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
            name=f"{section.branch.name} {section.year}-{section.name} Sem-{section.semester}",
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
        
        # Generate optimized schedule
        success = self._generate_optimized_schedule(timetable, courses, working_days)
        
        if not success:
            self.db.delete(timetable)
            self.db.commit()
            return None
        
        return timetable
    
    def _generate_optimized_schedule(self, timetable: Timetable, courses: List[Course], working_days: List[str]) -> bool:
        self.conflicts = []
        
        # Create time slots
        time_slots = self._generate_time_slots(timetable, working_days)
        
        # Create course requirements based on hours per week
        course_requirements = []
        for course in courses:
            hours_needed = course.subject.hours_per_week
            for _ in range(hours_needed):
                course_requirements.append(course)
        
        # Shuffle for randomization
        random.shuffle(course_requirements)
        
        # Track teacher and room availability
        teacher_schedule = {}
        room_schedule = {}
        
        # Assign courses to time slots with conflict checking
        for course in course_requirements:
            assigned = False
            
            # Try to assign to available slot
            for day in working_days:
                if assigned:
                    break
                    
                day_slots = [slot for slot in time_slots if slot['day'] == day and not slot['is_break']]
                random.shuffle(day_slots)
                
                for slot in day_slots:
                    if self._can_assign_course(course, slot, teacher_schedule, room_schedule):
                        # Create timetable slot
                        timetable_slot = TimetableSlot(
                            timetable_id=timetable.id,
                            course_id=course.id,
                            day=day,
                            start_time=slot['start_time'],
                            end_time=slot['end_time'],
                            is_break=False
                        )
                        
                        self.db.add(timetable_slot)
                        
                        # Update schedules
                        slot_key = f"{day}_{slot['start_time']}_{slot['end_time']}"
                        teacher_schedule[f"teacher_{course.teacher_id}_{slot_key}"] = True
                        if course.room_id:
                            room_schedule[f"room_{course.room_id}_{slot_key}"] = True
                        
                        assigned = True
                        break
            
            if not assigned:
                self.conflicts.append(f"Could not assign {course.subject.name} for {course.section.name}")
        
        # Add break slots
        self._add_break_slots(timetable, time_slots)
        
        self.db.commit()
        return len(self.conflicts) == 0
    
    def _can_assign_course(self, course: Course, slot: Dict, teacher_schedule: Dict, room_schedule: Dict) -> bool:
        slot_key = f"{slot['day']}_{slot['start_time']}_{slot['end_time']}"
        
        # Check teacher availability
        teacher_key = f"teacher_{course.teacher_id}_{slot_key}"
        if teacher_key in teacher_schedule:
            return False
        
        # Check room availability
        if course.room_id:
            room_key = f"room_{course.room_id}_{slot_key}"
            if room_key in room_schedule:
                return False
        
        # Check teacher daily hour limits
        day_teacher_hours = sum(1 for key in teacher_schedule.keys() 
                               if key.startswith(f"teacher_{course.teacher_id}_{slot['day']}_"))
        
        if day_teacher_hours >= course.teacher.max_hours_per_day:
            return False
        
        return True
    
    def _generate_time_slots(self, timetable: Timetable, working_days: List[str]) -> List[Dict]:
        slots = []
        
        for day in working_days:
            current_time = datetime.combine(datetime.today(), timetable.start_time)
            end_time = datetime.combine(datetime.today(), timetable.end_time)
            lunch_start = datetime.combine(datetime.today(), timetable.lunch_start)
            
            while current_time < end_time:
                slot_end = current_time + timedelta(minutes=timetable.period_duration)
                
                # Check for lunch break
                if (current_time.time() <= timetable.lunch_start <= slot_end.time()):
                    # Add lunch break
                    lunch_end = lunch_start + timedelta(minutes=timetable.lunch_duration)
                    slots.append({
                        'day': day,
                        'start_time': lunch_start.time(),
                        'end_time': lunch_end.time(),
                        'is_break': True,
                        'break_type': 'lunch'
                    })
                    current_time = lunch_end + timedelta(minutes=timetable.break_duration)
                    continue
                
                # Add regular slot
                if slot_end <= end_time:
                    slots.append({
                        'day': day,
                        'start_time': current_time.time(),
                        'end_time': slot_end.time(),
                        'is_break': False
                    })
                
                current_time = slot_end + timedelta(minutes=timetable.break_duration)
        
        return slots
    
    def _add_break_slots(self, timetable: Timetable, time_slots: List[Dict]):
        for slot in time_slots:
            if slot['is_break']:
                break_slot = TimetableSlot(
                    timetable_id=timetable.id,
                    day=slot['day'],
                    start_time=slot['start_time'],
                    end_time=slot['end_time'],
                    is_break=True,
                    break_type=slot.get('break_type', 'short')
                )
                self.db.add(break_slot)
    
    def _parse_time(self, time_str: str) -> time:
        try:
            return datetime.strptime(time_str, '%H:%M').time()
        except:
            return datetime.strptime('09:00', '%H:%M').time()
    
    def get_timetable_with_details(self, user_id: int, section_id: int) -> Optional[Dict]:
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
            'section': {
                'id': timetable.section.id,
                'name': timetable.section.name,
                'year': timetable.section.year,
                'semester': timetable.section.semester,
                'branch': timetable.section.branch.name
            },
            'working_days': timetable.working_days.split(','),
            'slots': {},
            'conflicts': self.conflicts
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
            
            if not slot.is_break and slot.course:
                slot_data.update({
                    'subject_name': slot.course.subject.name,
                    'subject_code': slot.course.subject.code,
                    'subject_type': slot.course.subject.subject_type,
                    'teacher_name': slot.course.teacher.name,
                    'teacher_id': slot.course.teacher.employee_id,
                    'room_number': slot.course.room.number if slot.course.room else 'TBA',
                    'building': slot.course.room.building if slot.course.room else 'TBA'
                })
            
            timetable_data['slots'][slot.day].append(slot_data)
        
        # Sort slots by time
        for day in timetable_data['slots']:
            timetable_data['slots'][day].sort(key=lambda x: x['start_time'])
        
        return timetable_data
    
    def get_conflicts_report(self, user_id: int) -> Dict:
        return {
            'conflicts': self.conflicts,
            'total_conflicts': len(self.conflicts),
            'status': 'success' if len(self.conflicts) == 0 else 'warning'
        }