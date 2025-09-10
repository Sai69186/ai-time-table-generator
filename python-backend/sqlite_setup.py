import sqlite3
import os

def setup_sqlite_database():
    try:
        # Create database file
        db_path = 'timetable.db'
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Create users table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                name TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Create sections table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS sections (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                user_id INTEGER,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        ''')
        
        # Create courses table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS courses (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                teacher TEXT NOT NULL,
                room TEXT NOT NULL,
                section_id INTEGER,
                user_id INTEGER,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (section_id) REFERENCES sections(id),
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        ''')
        
        conn.commit()
        conn.close()
        
        # Update .env file for SQLite
        with open('.env', 'w') as f:
            f.write('''DB_TYPE=sqlite
DB_PATH=timetable.db
JWT_SECRET=your_jwt_secret_key_here_change_in_production
''')
        
        print("SQLite database created successfully!")
        print("Tables created: users, sections, courses")
        print(".env file updated for SQLite")
        return True
        
    except Exception as e:
        print(f"Error setting up SQLite: {e}")
        return False

if __name__ == "__main__":
    print("Setting up SQLite Database (MySQL alternative)")
    print("=" * 45)
    if setup_sqlite_database():
        print("\nDatabase setup completed!")
        print("You can now start the server.")
    else:
        print("\nDatabase setup failed!")