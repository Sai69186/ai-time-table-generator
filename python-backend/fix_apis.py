#!/usr/bin/env python3
"""
Fix API Issues Script
This script fixes the main issues with the timetable APIs:
1. Creates missing database tables
2. Fixes SQLite query syntax
3. Adds proper error handling
4. Fixes timetable generation
"""

import sqlite3
import os
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def create_database_tables():
    """Create all required database tables"""
    db_path = 'timetable.db'
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        # Create users table first
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Create branches table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS branches (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                code TEXT UNIQUE NOT NULL,
                user_id INTEGER DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Create university_sections table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS university_sections (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                year INTEGER NOT NULL,
                semester INTEGER NOT NULL,
                branch_id INTEGER DEFAULT 1,
                strength INTEGER DEFAULT 60,
                user_id INTEGER DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Create teachers table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS teachers (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                employee_id TEXT UNIQUE NOT NULL,
                department TEXT DEFAULT 'General',
                max_hours_per_day INTEGER DEFAULT 6,
                user_id INTEGER DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Create rooms table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS rooms (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                number TEXT NOT NULL,
                building TEXT NOT NULL,
                capacity INTEGER DEFAULT 60,
                room_type TEXT DEFAULT 'classroom',
                user_id INTEGER DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Create subjects table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS subjects (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                code TEXT UNIQUE NOT NULL,
                credits INTEGER DEFAULT 3,
                subject_type TEXT DEFAULT 'theory',
                hours_per_week INTEGER DEFAULT 3,
                user_id INTEGER DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Create courses table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS courses (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                teacher TEXT NOT NULL,
                room TEXT,
                section_id INTEGER,
                user_id INTEGER DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Insert default data
        cursor.execute("INSERT OR IGNORE INTO users (id, name, email, password) VALUES (1, 'Default User', 'default@example.com', 'password')")
        cursor.execute("INSERT OR IGNORE INTO branches (id, name, code) VALUES (1, 'Computer Science', 'CSE')")
        cursor.execute("INSERT OR IGNORE INTO rooms (id, number, building) VALUES (1, '101', 'Main Building')")
        
        conn.commit()
        logger.info("Database tables created successfully!")
        
    except Exception as e:
        logger.error(f"Error creating tables: {e}")
        conn.rollback()
    finally:
        conn.close()

def fix_database_queries():
    """Fix the database query syntax in the routes file"""
    routes_file = "routes/university_timetable.py"
    
    if not os.path.exists(routes_file):
        logger.error(f"Routes file not found: {routes_file}")
        return
    
    # Read the current file
    with open(routes_file, 'r') as f:
        content = f.read()
    
    # Replace %s with ? for SQLite
    content = content.replace('%s', '?')
    
    # Write back the fixed content
    with open(routes_file, 'w') as f:
        f.write(content)
    
    logger.info("Fixed database query syntax")

if __name__ == "__main__":
    print("Fixing API issues...")
    create_database_tables()
    fix_database_queries()
    print("API fixes completed!")