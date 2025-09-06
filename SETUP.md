# AI Timetable Generator - Setup Guide

## Prerequisites

1. **Python 3.8+** installed on your system
2. **MySQL Server** installed and running
3. **pip** (Python package installer)

## Quick Setup

### 1. Database Setup

Make sure MySQL is running and create a database:

```sql
CREATE DATABASE timetable;
```

Update the database credentials in `python-backend/.env`:

```env
DB_HOST=localhost
DB_NAME=timetable
DB_USER=root
DB_PASSWORD=your_mysql_password
JWT_SECRET=your_jwt_secret_key_here_change_in_production
```

### 2. Start the Backend Server

**Option 1: Using the batch file (Windows)**
```bash
# Double-click or run from command prompt
start-python-backend.bat
```

**Option 2: Manual setup**
```bash
# Navigate to python-backend directory
cd python-backend

# Install dependencies
pip install -r requirements.txt

# Setup database tables
python setup_db.py

# Start the server
python start.py
```

### 3. Access the Application

1. Open your web browser
2. Navigate to `http://localhost:3000`
3. The backend API documentation is available at `http://localhost:3000/docs`

## Features

### Authentication System
- **User Registration**: Create new accounts with email validation
- **User Login**: Secure login with JWT tokens
- **Password Security**: Strong password requirements (8+ chars, numbers, special characters)
- **Session Management**: Automatic token verification and logout

### Timetable Management
- **Multi-step Wizard**: Intuitive timetable creation process
- **Section Management**: Create and manage different sections
- **Course Management**: Add courses with teachers and rooms
- **Conflict Detection**: Automatic scheduling conflict detection

## API Endpoints

### Authentication
- `POST /api/login` - User login
- `POST /api/register` - User registration
- `GET /api/verify` - Token verification
- `GET /api/profile` - Get user profile

### Database Schema

The system automatically creates the following tables:
- `users` - User accounts and authentication
- `sections` - Class sections
- `courses` - Course information
- `timetables` - Generated timetables

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Ensure MySQL is running
   - Check database credentials in `.env` file
   - Verify database exists

2. **Port Already in Use**
   - Change the port in `start.py` if 3000 is occupied
   - Update frontend API calls accordingly

3. **Module Not Found**
   - Run `pip install -r requirements.txt` in python-backend directory
   - Ensure you're in the correct directory

4. **CORS Issues**
   - The backend is configured to allow all origins for development
   - For production, update CORS settings in `main.py`

### Development Mode

The server runs in development mode with auto-reload enabled. Any changes to Python files will automatically restart the server.

## Security Notes

- Change the JWT_SECRET in production
- Use environment variables for sensitive data
- Implement proper password policies
- Enable HTTPS in production
- Restrict CORS origins in production

## Support

For issues and questions:
- Check the console logs for error messages
- Verify all prerequisites are installed
- Ensure database is properly configured
- Check API documentation at `/docs` endpoint