import mysql.connector
from mysql.connector import Error
import getpass

def setup_database():
    connection = None
    try:
        # Get MySQL password
        password = getpass.getpass("Enter MySQL root password: ")
        
        connection = mysql.connector.connect(
            host='localhost',
            user='root',
            password=password
        )
        
        cursor = connection.cursor()
        
        # Create database
        cursor.execute("CREATE DATABASE IF NOT EXISTS timetable")
        print("✓ Database 'timetable' created")
        
        cursor.execute("USE timetable")
        
        # Create tables
        tables = [
            ("users", """
                CREATE TABLE IF NOT EXISTS users (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    email VARCHAR(255) UNIQUE NOT NULL,
                    password VARCHAR(255) NOT NULL,
                    name VARCHAR(255) NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """),
            ("sections", """
                CREATE TABLE IF NOT EXISTS sections (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    user_id INT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(id)
                )
            """),
            ("courses", """
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
            """)
        ]
        
        for table_name, query in tables:
            cursor.execute(query)
            print(f"✓ Table '{table_name}' created")
        
        connection.commit()
        
        # Update .env file
        with open('.env', 'w') as f:
            f.write(f"""DB_HOST=localhost
DB_NAME=timetable
DB_USER=root
DB_PASSWORD={password}
JWT_SECRET=your_jwt_secret_key_here_change_in_production
""")
        print("✓ .env file updated")
        
        return True
        
    except Error as e:
        print(f"✗ Database error: {e}")
        return False
    finally:
        if connection and connection.is_connected():
            cursor.close()
            connection.close()

if __name__ == "__main__":
    print("MySQL Database Setup")
    print("=" * 20)
    if setup_database():
        print("\n✓ Database setup completed successfully!")
        print("You can now start the server with: python start.py")
    else:
        print("\n✗ Database setup failed!")