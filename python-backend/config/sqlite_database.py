import sqlite3
import os
import logging
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger(__name__)

class SQLiteDatabase:
    def __init__(self):
        self.db_path = os.getenv('DB_PATH', 'timetable.db')
        self.connection = None
        self.connect()
    
    def connect(self):
        try:
            self.connection = sqlite3.connect(self.db_path, check_same_thread=False)
            self.connection.row_factory = sqlite3.Row
            logger.info("SQLite Connected Successfully")
        except Exception as e:
            logger.error(f"SQLite connection failed: {e}")
            self.connection = None
    
    def execute_query(self, query, params=None):
        if not self.connection:
            return None
        try:
            cursor = self.connection.cursor()
            cursor.execute(query, params or ())
            result = cursor.fetchall()
            # Convert Row objects to dictionaries
            return [dict(row) for row in result] if result else []
        except Exception as e:
            logger.error(f"Query error: {e}")
            return None
    
    def execute_insert(self, query, params=None):
        if not self.connection:
            return None
        try:
            cursor = self.connection.cursor()
            cursor.execute(query, params or ())
            self.connection.commit()
            return cursor.lastrowid
        except Exception as e:
            logger.error(f"Insert error: {e}")
            self.connection.rollback()
            return None

database = SQLiteDatabase()