#!/usr/bin/env python3
import subprocess
import sys
import os
import time

def run_setup():
    print("Setting up AI Timetable Generator...")
    
    # Setup database
    try:
        subprocess.run([sys.executable, "setup_database.py"], check=True)
        print("✓ Database setup completed")
    except subprocess.CalledProcessError:
        print("✗ Database setup failed")
        return False
    
    return True

def start_backend():
    print("Starting Python backend server...")
    os.chdir("python-backend")
    
    try:
        # Start the FastAPI server
        subprocess.run([sys.executable, "main.py"], check=True)
    except KeyboardInterrupt:
        print("\nServer stopped by user")
    except subprocess.CalledProcessError as e:
        print(f"Server failed to start: {e}")

if __name__ == "__main__":
    if run_setup():
        start_backend()
    else:
        print("Setup failed. Please check the errors above.")