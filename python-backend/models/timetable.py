from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean, Text, Time
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime

Base = declarative_base()

class Section(Base):
    __tablename__ = "sections"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), nullable=False)
    year = Column(Integer, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    courses = relationship("Course", back_populates="section", cascade="all, delete-orphan")
    timetables = relationship("Timetable", back_populates="section", cascade="all, delete-orphan")

class Course(Base):
    __tablename__ = "courses"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    code = Column(String(20), nullable=False)
    teacher = Column(String(100), nullable=False)
    room = Column(String(50))
    duration = Column(Integer, default=1)
    color = Column(String(7), default="#3f51b5")
    section_id = Column(Integer, ForeignKey("sections.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    section = relationship("Section", back_populates="courses")
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
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    day = Column(String(10), nullable=False)
    start_time = Column(Time, nullable=False)
    end_time = Column(Time, nullable=False)
    is_break = Column(Boolean, default=False)
    break_type = Column(String(20))  # 'short', 'lunch'
    
    timetable = relationship("Timetable", back_populates="slots")
    course = relationship("Course", back_populates="timetable_slots")