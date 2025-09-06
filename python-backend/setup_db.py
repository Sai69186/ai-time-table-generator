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
    try:
        # Connect to MySQL server (without specifying database)
        connection = mysql.connector.connect(
            host=os.getenv('DB_HOST', 'localhost'),
            user=os.getenv('DB_USER', 'root'),
            password=os.getenv('DB_PASSWORD', 'root')
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
            'courses': '''
                CREATE TABLE IF NOT EXISTS courses (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    teacher VARCHAR(255) NOT NULL,
                    room VARCHAR(255) NOT NULL,
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
    try:
        connection = mysql.connector.connect(
            host=os.getenv('DB_HOST', 'localhost'),
            database=os.getenv('DB_NAME', 'timetable'),
            user=os.getenv('DB_USER', 'root'),
            password=os.getenv('DB_PASSWORD', 'root')
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