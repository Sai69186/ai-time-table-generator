#!/usr/bin/env python3
"""
Script to check existing users in the database
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from models.user import User
from config.database import database

def check_users():
    """Check all users in the database"""
    try:
        users = User.get_all_users()
        print(f"Total users in database: {len(users)}")
        print("-" * 50)
        
        for user in users:
            print(f"ID: {user['id']}")
            print(f"Email: {user['email']}")
            print(f"Name: {user['name']}")
            print(f"Created: {user['created_at']}")
            print("-" * 30)
            
    except Exception as e:
        print(f"Error checking users: {e}")

def clear_users():
    """Clear all users from database (use with caution)"""
    confirm = input("Are you sure you want to delete ALL users? (type 'YES' to confirm): ")
    if confirm == 'YES':
        try:
            query = "DELETE FROM users"
            result = database.execute_query("DELETE FROM users")
            database.connection.commit()
            print("All users deleted successfully!")
        except Exception as e:
            print(f"Error deleting users: {e}")
    else:
        print("Operation cancelled.")

if __name__ == "__main__":
    print("User Database Management")
    print("=" * 30)
    
    while True:
        print("\n1. Check users")
        print("2. Clear all users")
        print("3. Exit")
        
        choice = input("\nEnter your choice (1-3): ").strip()
        
        if choice == '1':
            check_users()
        elif choice == '2':
            clear_users()
        elif choice == '3':
            print("Goodbye!")
            break
        else:
            print("Invalid choice. Please try again.")