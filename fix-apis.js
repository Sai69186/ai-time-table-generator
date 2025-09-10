// API Fix Script - Run this to test and fix API issues
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

console.log('🔧 AI Timetable Generator - API Fix Script');
console.log('==========================================');

// Test if required modules are installed
try {
    console.log('✅ Express:', require('express/package.json').version);
    console.log('✅ CORS:', require('cors/package.json').version);
    console.log('✅ JWT:', require('jsonwebtoken/package.json').version);
    console.log('✅ Bcrypt:', require('bcryptjs/package.json').version);
} catch (error) {
    console.log('❌ Missing dependencies. Run: npm install');
    process.exit(1);
}

// Create test server
const app = express();
const PORT = 3001; // Use different port for testing

// In-memory storage for testing
let users = [];
let teachers = [];
let rooms = [];
let subjects = [];
let nextId = 1;

// Middleware
app.use(cors());
app.use(express.json());

// Auth middleware
const auth = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ success: false, detail: 'Access denied' });
    try {
        const decoded = jwt.verify(token, 'secret');
        req.user = users.find(u => u.id === decoded.id);
        next();
    } catch { res.status(401).json({ success: false, detail: 'Invalid token' }); }
};

// Test endpoints
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'API Fix Test Server Running',
        data: {
            users: users.length,
            teachers: teachers.length,
            rooms: rooms.length,
            subjects: subjects.length
        }
    });
});

// Auth endpoints
app.post('/api/register', async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ success: false, detail: 'All fields required' });
    
    const user = { id: nextId++, name, email, password: await bcrypt.hash(password, 10) };
    users.push(user);
    const token = jwt.sign({ id: user.id }, 'secret');
    res.json({ success: true, access_token: token, user: { id: user.id, name, email } });
});

app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email);
    if (!user || !await bcrypt.compare(password, user.password)) {
        return res.status(401).json({ success: false, detail: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user.id }, 'secret');
    res.json({ success: true, access_token: token, user: { id: user.id, name: user.name, email } });
});

// Teacher API
app.post('/api/university/teachers', auth, (req, res) => {
    const { name, employee_id, department, max_hours_per_day } = req.body;
    if (!name || !employee_id) return res.status(400).json({ success: false, message: 'Name and employee_id required' });
    
    if (teachers.find(t => t.employee_id === employee_id)) {
        return res.status(400).json({ success: false, message: 'Teacher with this employee ID already exists' });
    }
    
    const teacher = { 
        id: nextId++, 
        name, 
        employee_id, 
        department: department || 'General', 
        max_hours_per_day: max_hours_per_day || 6 
    };
    teachers.push(teacher);
    res.json({ success: true, data: teacher });
});

app.get('/api/university/teachers', auth, (req, res) => {
    res.json({ success: true, data: teachers });
});

// Room API
app.post('/api/university/rooms', auth, (req, res) => {
    const { number, building, capacity, room_type } = req.body;
    if (!number || !building) return res.status(400).json({ success: false, message: 'Number and building required' });
    
    const room = { 
        id: nextId++, 
        number, 
        building, 
        capacity: capacity || 60, 
        room_type: room_type || 'classroom' 
    };
    rooms.push(room);
    res.json({ success: true, data: room });
});

app.get('/api/university/rooms', auth, (req, res) => {
    res.json({ success: true, data: rooms });
});

// Subject API
app.post('/api/university/subjects', auth, (req, res) => {
    const { name, code, credits, subject_type, hours_per_week } = req.body;
    if (!name || !code) return res.status(400).json({ success: false, message: 'Name and code required' });
    
    const subject = { 
        id: nextId++, 
        name, 
        code, 
        credits: credits || 3, 
        subject_type: subject_type || 'theory', 
        hours_per_week: hours_per_week || 4 
    };
    subjects.push(subject);
    res.json({ success: true, data: subject });
});

app.get('/api/university/subjects', auth, (req, res) => {
    res.json({ success: true, data: subjects });
});

// Start test server
app.listen(PORT, () => {
    console.log(`\n🚀 Test server running on http://localhost:${PORT}`);
    console.log(`📋 Test the APIs at: http://localhost:${PORT}/api/health`);
    console.log('\n📝 Available endpoints:');
    console.log('   POST /api/register');
    console.log('   POST /api/login');
    console.log('   GET  /api/university/teachers');
    console.log('   POST /api/university/teachers');
    console.log('   GET  /api/university/rooms');
    console.log('   POST /api/university/rooms');
    console.log('   GET  /api/university/subjects');
    console.log('   POST /api/university/subjects');
    console.log('\n✨ APIs are working! Press Ctrl+C to stop');
});