from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean, Time, Float
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime

Base = declarative_base()

class Branch(Base):
    __tablename__ = "branches"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    code = Column(String(10), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    sections = relationship("Section", back_populates="branch", cascade="all, delete-orphan")

class Section(Base):
    __tablename__ = "sections"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), nullable=False)
    year = Column(Integer, nullable=False)
    semester = Column(Integer, nullable=False)
    strength = Column(Integer, default=60)
    branch_id = Column(Integer, ForeignKey("branches.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    branch = relationship("Branch", back_populates="sections")
    courses = relationship("Course", back_populates="section", cascade="all, delete-orphan")
    timetables = relationship("Timetable", back_populates="section", cascade="all, delete-orphan")

class Teacher(Base):
    __tablename__ = "teachers"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    employee_id = Column(String(20), unique=True, nullable=False)
    department = Column(String(50))
    max_hours_per_day = Column(Integer, default=6)
    max_hours_per_week = Column(Integer, default=24)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    courses = relationship("Course", back_populates="teacher")

class Room(Base):
    __tablename__ = "rooms"
    
    id = Column(Integer, primary_key=True, index=True)
    number = Column(String(20), nullable=False)
    building = Column(String(50))
    capacity = Column(Integer, default=60)
    room_type = Column(String(20), default="classroom")
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    courses = relationship("Course", back_populates="room")

class Subject(Base):
    __tablename__ = "subjects"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    code = Column(String(20), nullable=False)
    credits = Column(Integer, default=3)
    subject_type = Column(String(20), default="theory")
    hours_per_week = Column(Integer, default=3)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    courses = relationship("Course", back_populates="subject")

class Course(Base):
    __tablename__ = "courses"
    
    id = Column(Integer, primary_key=True, index=True)
    section_id = Column(Integer, ForeignKey("sections.id"), nullable=False)
    subject_id = Column(Integer, ForeignKey("subjects.id"), nullable=False)
    teacher_id = Column(Integer, ForeignKey("teachers.id"), nullable=False)
    room_id = Column(Integer, ForeignKey("rooms.id"))
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    section = relationship("Section", back_populates="courses")
    subject = relationship("Subject", back_populates="courses")
    teacher = relationship("Teacher", back_populates="courses")
    room = relationship("Room", back_populates="courses")
    timetable_slots = relationship("TimetableSlot", back_populates="course", cascade="all, delete-orphan")

class Timetable(Base):
    __tablename__ = "timetables"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    section_id = Column(Integer, ForeignKey("sections.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    start_time = Column(Time, nullable=False)
    end_time = Column(Time, nullable=False)
    period_duration = Column(Integer, default=50)
    break_duration = Column(Integer, default=10)
    lunch_start = Column(Time)
    lunch_duration = Column(Integer, default=45)
    working_days = Column(String(100), default="Monday,Tuesday,Wednesday,Thursday,Friday")
    created_at = Column(DateTime, default=datetime.utcnow)
    
    section = relationship("Section", back_populates="timetables")
    slots = relationship("TimetableSlot", back_populates="timetable", cascade="all, delete-orphan")

class TimetableSlot(Base):
    __tablename__ = "timetable_slots"
    
    id = Column(Integer, primary_key=True, index=True)
    timetable_id = Column(Integer, ForeignKey("timetables.id"), nullable=False)
    course_id = Column(Integer, ForeignKey("courses.id"))
    day = Column(String(10), nullable=False)
    start_time = Column(Time, nullable=False)
    end_time = Column(Time, nullable=False)
    is_break = Column(Boolean, default=False)
    break_type = Column(String(20))
    
    timetable = relationship("Timetable", back_populates="slots")
    course = relationship("Course", back_populates="timetable_slots")