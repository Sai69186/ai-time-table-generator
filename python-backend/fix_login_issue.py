#!/usr/bin/env python3
"""
Script to diagnose and fix login issues
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from models.user import User
from services.auth_service import authenticate_user, register_user
from config.sqlite_database import database

def test_database_connection():
    """Test if database connection is working"""
    try:
        # Test basic query
        result = database.execute_query("SELECT 1 as test")
        if result:
            print("[OK] Database connection: OK")
            return True
        else:
            print("[ERROR] Database connection: Failed")
            return False
    except Exception as e:
        print(f"[ERROR] Database connection error: {e}")
        return False

def check_users_table():
    """Check if users table exists and has data"""
    try:
        result = database.execute_query("SELECT COUNT(*) as count FROM users")
        if result:
            count = result[0]['count']
            print(f"[OK] Users table exists with {count} users")
            return True
        else:
            print("[ERROR] Users table query failed")
            return False
    except Exception as e:
        print(f"[ERROR] Users table error: {e}")
        return False

def create_test_user():
    """Create a test user for login testing"""
    try:
        test_email = "test@example.com"
        test_password = "Test@123456"
        test_name = "Test User"
        
        # Check if test user already exists
        existing_user = User.get_user_by_email(test_email)
        if existing_user:
            print(f"[OK] Test user already exists: {test_email}")
            return test_email, test_password
        
        # Create test user
        user_id = register_user(test_email, test_password, test_name)
        if user_id:
            print(f"[OK] Test user created: {test_email} (ID: {user_id})")
            return test_email, test_password
        else:
            print("[ERROR] Failed to create test user")
            return None, None
    except Exception as e:
        print(f"[ERROR] Error creating test user: {e}")
        return None, None

def test_authentication(email, password):
    """Test authentication with given credentials"""
    try:
        result = authenticate_user(email, password)
        if result:
            print(f"[OK] Authentication successful for: {email}")
            return True
        else:
            print(f"[ERROR] Authentication failed for: {email}")
            return False
    except Exception as e:
        print(f"[ERROR] Authentication error: {e}")
        return False

def main():
    print("Login Issue Diagnosis")
    print("=" * 30)
    
    # Step 1: Test database connection
    print("\n1. Testing database connection...")
    if not test_database_connection():
        print("[ERROR] Database connection failed. Please check your database setup.")
        return
    
    # Step 2: Check users table
    print("\n2. Checking users table...")
    if not check_users_table():
        print("[ERROR] Users table issue. Please run setup_db.py first.")
        return
    
    # Step 3: Create test user
    print("\n3. Creating test user...")
    test_email, test_password = create_test_user()
    if not test_email:
        print("[ERROR] Failed to create test user.")
        return
    
    # Step 4: Test authentication
    print("\n4. Testing authentication...")
    if test_authentication(test_email, test_password):
        print(f"\n[SUCCESS] Login should work with:")
        print(f"   Email: {test_email}")
        print(f"   Password: {test_password}")
    else:
        print("[ERROR] Authentication test failed.")
    
    print("\n" + "=" * 50)
    print("Diagnosis complete!")

if __name__ == "__main__":
    main()