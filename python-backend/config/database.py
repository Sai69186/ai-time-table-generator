import mysql.connector
from mysql.connector import Error
import os
from dotenv import load_dotenv

load_dotenv()

class Database:
    def __init__(self):
        self.connection = None
        self.cursor = None
        self.connect()
        self.create_tables()
    
    def connect(self):
        try:
            # First try to create database if it doesn't exist
            temp_connection = mysql.connector.connect(
                host=os.getenv('DB_HOST', 'localhost'),
                user=os.getenv('DB_USER', 'root'),
                password=os.getenv('DB_PASSWORD', '')
            )
            temp_cursor = temp_connection.cursor()
            temp_cursor.execute("CREATE DATABASE IF NOT EXISTS timetable")
            temp_connection.commit()
            temp_cursor.close()
            temp_connection.close()
            
            # Now connect to the database
            self.connection = mysql.connector.connect(
                host=os.getenv('DB_HOST', 'localhost'),
                database=os.getenv('DB_NAME', 'timetable'),
                user=os.getenv('DB_USER', 'root'),
                password=os.getenv('DB_PASSWORD', '')
            )
            self.cursor = self.connection.cursor(dictionary=True)
            print("MySQL Connected Successfully")
        except Error as e:
            print(f"MySQL connection failed: {e}")
            print("Please ensure MySQL is running and credentials are correct")
            self.connection = None
            self.cursor = None
    
    def create_tables(self):
        if not self.connection:
            return
        
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
                    year INT DEFAULT 1,
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
                    room VARCHAR(255),
                    section_id INT,
                    user_id INT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (section_id) REFERENCES sections(id),
                    FOREIGN KEY (user_id) REFERENCES users(id)
                )
            ''',
            'branches': '''
                CREATE TABLE IF NOT EXISTS branches (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    code VARCHAR(10) NOT NULL,
                    user_id INT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(id)
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
                    FOREIGN KEY (branch_id) REFERENCES branches(id),
                    FOREIGN KEY (user_id) REFERENCES users(id)
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
                    FOREIGN KEY (user_id) REFERENCES users(id)
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
                    FOREIGN KEY (user_id) REFERENCES users(id)
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
                    FOREIGN KEY (user_id) REFERENCES users(id)
                )
            '''
        }
        
        try:
            for table_name, query in tables.items():
                self.cursor.execute(query)
            self.connection.commit()
        except Error as e:
            print(f"Error creating tables: {e}")
    
    def execute_query(self, query, params=None):
        if not self.cursor:
            return None
        try:
            self.cursor.execute(query, params or ())
            return self.cursor.fetchall()
        except Error as e:
            print(f"Query error: {e}")
            return None
    
    def execute_insert(self, query, params=None):
        if not self.cursor:
            return None
        try:
            self.cursor.execute(query, params or ())
            self.connection.commit()
            return self.cursor.lastrowid
        except Error as e:
            print(f"Insert error: {e}")
            if e.errno == 1062:  # Duplicate entry error
                print(f"Duplicate entry error: {e}")
            self.connection.rollback()
            return None

database = Database()