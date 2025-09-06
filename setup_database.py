#!/usr/bin/env python3
"""
Database setup script for AI Timetable Generator
This script creates the MySQL database and required tables
"""

import mysql.connector
from mysql.connector import Error
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv('python-backend/.env')

def create_database():
    """Create the database if it doesn't exist"""
    try:
        # Connect to MySQL server (without specifying database)
        connection = mysql.connector.connect(
            host=os.getenv('DB_HOST', 'localhost'),
            user=os.getenv('DB_USER', 'root'),
            password=os.getenv('DB_PASSWORD', '')
        )
        
        cursor = connection.cursor()
        
        # Create database
        database_name = os.getenv('DB_NAME', 'timetable')
        cursor.execute(f"CREATE DATABASE IF NOT EXISTS {database_name}")
        print(f"[OK] Database '{database_name}' created successfully")
        
        # Use the database
        cursor.execute(f"USE {database_name}")
        
        # Create tables
        tables = {
            'users': '''
                CREATE TABLE IF NOT EXISTS users (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    email VARCHAR(255) UNIQUE NOT NULL,
                    password VARCHAR(255) NOT NULL,
                    name VARCHAR(255) NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''',
            'sections': '''
                CREATE TABLE IF NOT EXISTS sections (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    user_id INT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(id)
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
                    FOREIGN KEY (section_id) REFERENCES sections(id),
                    FOREIGN KEY (user_id) REFERENCES users(id)
                )
            ''',
            'timetables': '''
                CREATE TABLE IF NOT EXISTS timetables (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    data JSON,
                    user_id INT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(id)
                )
            '''
        }
        
        for table_name, query in tables.items():
            cursor.execute(query)
            print(f"[OK] Table '{table_name}' created successfully")
        
        connection.commit()
        print("[OK] Database setup completed successfully!")
        
    except Error as e:
        print(f"[ERROR] Error setting up database: {e}")
        return False
    finally:
        if connection and connection.is_connected():
            cursor.close()
            connection.close()
    
    return True

if __name__ == "__main__":
    print("Setting up AI Timetable Generator Database...")
    print("=" * 50)
    
    # Check if MySQL is running
    try:
        test_connection = mysql.connector.connect(
            host=os.getenv('DB_HOST', 'localhost'),
            user=os.getenv('DB_USER', 'root'),
            password=os.getenv('DB_PASSWORD', '')
        )
        test_connection.close()
        print("[OK] MySQL connection successful")
    except Error as e:
        print(f"[ERROR] Cannot connect to MySQL: {e}")
        print("Please ensure MySQL is installed and running")
        print("Default credentials: host=localhost, user=root, password=''")
        exit(1)
    
    if create_database():
        print("\n[SUCCESS] Setup completed! You can now start the server with:")
        print("   cd python-backend")
        print("   python main.py")
    else:
        print("\n[ERROR] Setup failed. Please check the error messages above.")