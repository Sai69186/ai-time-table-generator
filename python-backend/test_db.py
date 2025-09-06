from config.database import database

def test_connection():
    print("Testing MySQL connection...")
    
    if database.connection is None:
        print("[FAILED] Database connection failed!")
        return False
    
    try:
        database.cursor.execute("SELECT 1")
        result = database.cursor.fetchone()
        print("[SUCCESS] Database connected successfully!")
        
        # Test tables
        database.cursor.execute("SHOW TABLES")
        tables = database.cursor.fetchall()
        print(f"[INFO] Available tables: {[table['Tables_in_timetable'] for table in tables]}")
        
        # Test users table
        database.cursor.execute("SELECT COUNT(*) as count FROM users")
        count = database.cursor.fetchone()
        print(f"[INFO] Users table: {count['count']} records")
        
        return True
        
    except Exception as e:
        print(f"[ERROR] Connection test failed: {e}")
        return False

if __name__ == "__main__":
    test_connection()