#!/usr/bin/env python3
"""
Test script for user registration
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from services.auth_service import register_user, authenticate_user
from models.user import User
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)

def test_registration():
    """Test user registration functionality"""
    print("Testing User Registration")
    print("=" * 30)
    
    # Test data
    test_email = "test@example.com"
    test_password = "TestPass123!"
    test_name = "Test User"
    
    print(f"Testing registration for: {test_email}")
    
    # Check if user already exists
    existing_user = User.get_user_by_email(test_email)
    if existing_user:
        print(f"User {test_email} already exists. Skipping registration test.")
        return
    
    # Test registration
    user_id = register_user(test_email, test_password, test_name)
    
    if user_id:
        print(f"✅ Registration successful! User ID: {user_id}")
        
        # Test authentication
        auth_result = authenticate_user(test_email, test_password)
        if auth_result:
            print("✅ Authentication successful!")
            print(f"User data: {auth_result}")
        else:
            print("❌ Authentication failed!")
    else:
        print("❌ Registration failed!")

def test_duplicate_registration():
    """Test duplicate email registration"""
    print("\nTesting Duplicate Registration")
    print("=" * 30)
    
    test_email = "duplicate@example.com"
    test_password = "TestPass123!"
    test_name = "Duplicate User"
    
    # First registration
    print(f"First registration for: {test_email}")
    user_id1 = register_user(test_email, test_password, test_name)
    
    if user_id1:
        print(f"✅ First registration successful! User ID: {user_id1}")
        
        # Second registration (should fail)
        print(f"Second registration for: {test_email}")
        user_id2 = register_user(test_email, test_password, test_name)
        
        if user_id2 is None:
            print("✅ Duplicate registration correctly rejected!")
        else:
            print("❌ Duplicate registration should have been rejected!")
    else:
        print("❌ First registration failed!")

if __name__ == "__main__":
    test_registration()
    test_duplicate_registration()