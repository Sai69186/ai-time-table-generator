#!/usr/bin/env python3
"""
Database setup script for AI Timetable Generator
"""
import mysql.connector
from mysql.connector import Error
import os
from dotenv import load_dotenv

load_dotenv()

def create_database():
    """Create the database if it doesn't exist"""
    connection = None
    try:
        # Get password from user if not in env
        db_password = os.getenv('DB_PASSWORD', '')
        if not db_password:
            db_password = input('Enter MySQL root password (or press Enter if no password): ')
        
        # Connect to MySQL server (without specifying database)
        connection = mysql.connector.connect(
            host=os.getenv('DB_HOST', 'localhost'),
            user=os.getenv('DB_USER', 'root'),
            password=db_password
        )
        
        cursor = connection.cursor()
        
        # Create database
        db_name = os.getenv('DB_NAME', 'timetable')
        cursor.execute(f"CREATE DATABASE IF NOT EXISTS {db_name}")
        print(f"Database '{db_name}' created successfully or already exists")
        
        # Use the database
        cursor.execute(f"USE {db_name}")
        
        # Create tables
        tables = {
            'users': '''
                CREATE TABLE IF NOT EXISTS users (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    email VARCHAR(255) UNIQUE NOT NULL,
                    password VARCHAR(255) NOT NULL,
                    name VARCHAR(255) NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    INDEX idx_email (email)
                )
            ''',
            'sections': '''
                CREATE TABLE IF NOT EXISTS sections (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    user_id INT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                    INDEX idx_user_id (user_id)
                )
            ''',
            'branches': '''
                CREATE TABLE IF NOT EXISTS branches (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    code VARCHAR(10) NOT NULL,
                    user_id INT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                    INDEX idx_user_id (user_id)
                )
            ''',
            'university_sections': '''
                CREATE TABLE IF NOT EXISTS university_sections (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    year INT NOT NULL,
                    semester INT NOT NULL,
                    branch_id INT,
                    strength INT DEFAULT 60,
                    user_id INT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE,
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                    INDEX idx_user_id (user_id)
                )
            ''',
            'teachers': '''
                CREATE TABLE IF NOT EXISTS teachers (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    employee_id VARCHAR(20) UNIQUE NOT NULL,
                    department VARCHAR(255),
                    max_hours_per_day INT DEFAULT 6,
                    user_id INT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                    INDEX idx_user_id (user_id)
                )
            ''',
            'rooms': '''
                CREATE TABLE IF NOT EXISTS rooms (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    number VARCHAR(20) NOT NULL,
                    building VARCHAR(255),
                    capacity INT DEFAULT 60,
                    room_type VARCHAR(20) DEFAULT 'classroom',
                    user_id INT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                    INDEX idx_user_id (user_id)
                )
            ''',
            'subjects': '''
                CREATE TABLE IF NOT EXISTS subjects (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    code VARCHAR(20) NOT NULL,
                    credits INT DEFAULT 3,
                    subject_type VARCHAR(20) DEFAULT 'theory',
                    hours_per_week INT DEFAULT 3,
                    user_id INT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                    INDEX idx_user_id (user_id)
                )
            ''',
            'courses': '''
                CREATE TABLE IF NOT EXISTS courses (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    teacher VARCHAR(255) NOT NULL,
                    room VARCHAR(255),
                    section_id INT,
                    user_id INT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (section_id) REFERENCES sections(id) ON DELETE CASCADE,
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                    INDEX idx_section_id (section_id),
                    INDEX idx_user_id (user_id)
                )
            ''',
            'timetables': '''
                CREATE TABLE IF NOT EXISTS timetables (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    data JSON,
                    user_id INT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                    INDEX idx_user_id (user_id)
                )
            '''
        }
        
        for table_name, query in tables.items():
            cursor.execute(query)
            print(f"Table '{table_name}' created successfully or already exists")
        
        connection.commit()
        print("Database setup completed successfully!")
        
    except Error as e:
        print(f"Error setting up database: {e}")
        return False
    finally:
        if connection and connection.is_connected():
            cursor.close()
            connection.close()
    
    return True

def test_connection():
    """Test database connection"""
    connection = None
    try:
        db_password = os.getenv('DB_PASSWORD', '')
        if not db_password:
            db_password = input('Enter MySQL root password (or press Enter if no password): ')
            
        connection = mysql.connector.connect(
            host=os.getenv('DB_HOST', 'localhost'),
            database=os.getenv('DB_NAME', 'timetable'),
            user=os.getenv('DB_USER', 'root'),
            password=db_password
        )
        
        if connection.is_connected():
            cursor = connection.cursor()
            cursor.execute("SELECT COUNT(*) FROM users")
            user_count = cursor.fetchone()[0]
            print(f"Database connection successful! Users in database: {user_count}")
            return True
            
    except Error as e:
        print(f"Database connection failed: {e}")
        return False
    finally:
        if connection and connection.is_connected():
            cursor.close()
            connection.close()

if __name__ == "__main__":
    print("Setting up AI Timetable Generator Database...")
    print("=" * 50)
    
    if create_database():
        print("\nTesting database connection...")
        test_connection()
    else:
        print("Database setup failed!")