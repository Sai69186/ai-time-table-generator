#!/usr/bin/env python3
"""
Test login functionality
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from services.auth_service import authenticate_user, register_user
from config.database import database

def test_login():
    """Test login with existing users"""
    # First, let's see what passwords are actually stored
    print("Checking stored password hashes...")
    query = "SELECT email, password FROM users"
    users = database.execute_query(query)
    
    for user in users:
        print(f"Email: {user['email']}")
        print(f"Password hash: {user['password'][:50]}...")
        print()
    
    test_passwords = ["password123", "Password123!", "admin123", "123456", "password"]
    test_users = [
        "john@example.com",
        "magulurisaichowdary143@gmail.com", 
        "231@gmail.com"
    ]
    
    print("Testing login combinations...")
    print("-" * 50)
    
    for email in test_users:
        print(f"Testing login for: {email}")
        for password in test_passwords:
            try:
                user = authenticate_user(email, password)
                if user:
                    print(f"SUCCESS: {email} with password: {password}")
                    print(f"  User: {user['name']} (ID: {user['id']})")
                    break
                else:
                    print(f"FAILED: {email} with password: {password}")
            except Exception as e:
                print(f"ERROR testing {email} with {password}: {e}")
        print()

def create_test_user():
    """Create a simple test user"""
    email = "test@example.com"
    password = "Test123!"
    name = "Test User"
    
    print(f"Creating test user: {email}")
    try:
        user_id = register_user(email, password, name)
        if user_id:
            print(f"✓ Test user created successfully with ID: {user_id}")
            print(f"  Email: {email}")
            print(f"  Password: {password}")
            print(f"  Name: {name}")
        else:
            print("✗ Failed to create test user (email might already exist)")
    except Exception as e:
        print(f"✗ Error creating test user: {e}")

if __name__ == "__main__":
    print("Authentication Test")
    print("=" * 30)
    
    print("\n1. Testing existing users...")
    test_login()
    
    print("\n2. Creating test user...")
    create_test_user()
    
    print("\n3. Testing new test user...")
    try:
        user = authenticate_user("test@example.com", "Test123!")
        if user:
            print("✓ Test user login successful")
        else:
            print("✗ Test user login failed")
    except Exception as e:
        print(f"✗ Error testing new user: {e}")