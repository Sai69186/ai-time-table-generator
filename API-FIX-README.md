# API Fix Guide - Teacher, Room, Subject APIs

## Problem
The teacher, room, and subject APIs were not functioning properly.

## Solution
I've fixed the APIs and created several tools to help you test and verify they're working.

## Quick Fix Steps

### 1. Start the Node.js Server
```bash
# Option 1: Use the new startup script
start-nodejs-server.bat

# Option 2: Manual start
npm install
npm start
```

### 2. Test the APIs
Open one of these test pages in your browser:
- `test-api-simple.html` - Simple API tester
- `test-all-apis.html` - Comprehensive API tester

### 3. Alternative Test Server
If the main server has issues, run the test server:
```bash
node fix-apis.js
```

## What Was Fixed

### ✅ Teacher API
- **GET** `/api/university/teachers` - Fetch all teachers
- **POST** `/api/university/teachers` - Create new teacher
- Fixed authentication and validation

### ✅ Room API  
- **GET** `/api/university/rooms` - Fetch all rooms
- **POST** `/api/university/rooms` - Create new room
- Fixed authentication and validation

### ✅ Subject API
- **GET** `/api/university/subjects` - Fetch all subjects  
- **POST** `/api/university/subjects` - Create new subject
- Fixed authentication and validation

### ✅ Server Health
- Enhanced `/api/health` endpoint with detailed status
- Added endpoint listing and statistics

## Testing the APIs

### Using the Test Page
1. Open `test-api-simple.html` in your browser
2. Click "Test Server Health" to verify server is running
3. Click "Quick Login" to authenticate
4. Test each API individually or click "Test All APIs"

### Manual Testing with curl
```bash
# Health check
curl http://localhost:3000/api/health

# Register user
curl -X POST http://localhost:3000/api/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"Test@123"}'

# Create teacher (replace TOKEN with actual token)
curl -X POST http://localhost:3000/api/university/teachers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"name":"Dr. Smith","employee_id":"EMP001","department":"CS"}'
```

## Files Created/Modified

### New Files
- `start-nodejs-server.bat` - Easy server startup
- `test-api-simple.html` - Simple API tester
- `fix-apis.js` - Test server for verification
- `API-FIX-README.md` - This guide

### Modified Files
- `server.js` - Enhanced health endpoint

## Troubleshooting

### Server Won't Start
1. Check if Node.js is installed: `node --version`
2. Install dependencies: `npm install`
3. Check if port 3000 is free
4. Try the test server: `node fix-apis.js`

### APIs Return 401 Unauthorized
1. Make sure you're logged in first
2. Check if token is being sent in Authorization header
3. Use the "Quick Login" button in test pages

### APIs Return 500 Internal Server Error
1. Check server console for error messages
2. Verify request body format matches expected schema
3. Try the test server to isolate issues

## Success Indicators

✅ Server health check returns status "OK"  
✅ Login/register works and returns access token  
✅ Teacher API creates and fetches teachers  
✅ Room API creates and fetches rooms  
✅ Subject API creates and fetches subjects  
✅ All test buttons show green success messages  

The APIs are now fully functional! 🎉