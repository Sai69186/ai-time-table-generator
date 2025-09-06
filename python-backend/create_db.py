import mysql.connector
import os
from dotenv import load_dotenv

load_dotenv()

try:
    connection = mysql.connector.connect(
        host=os.getenv('DB_HOST', 'localhost'),
        user=os.getenv('DB_USER', 'root'),
        password=os.getenv('DB_PASSWORD', '')
    )
    cursor = connection.cursor()
    cursor.execute("CREATE DATABASE IF NOT EXISTS timetable")
    print("[SUCCESS] Database 'timetable' created successfully!")
    connection.close()
except Exception as e:
    print(f"[ERROR] Failed to create database: {e}")