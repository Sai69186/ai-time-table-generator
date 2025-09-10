const express = require('express');
const cors = require('cors');
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// In-memory storage
let users = [];
let branches = [];
let sections = [];
let teachers = [];
let rooms = [];
let subjects = [];
let courses = [];
let timetables = {};
let nextId = 1;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Auth middleware
const auth = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ success: false, detail: 'Access denied' });
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        req.user = users.find(u => u.id === decoded.id);
        next();
    } catch { res.status(401).json({ success: false, detail: 'Invalid token' }); }
};

// Auth routes
const handleRegister = async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ success: false, detail: 'All fields required' });
    if (users.find(u => u.email === email)) return res.status(400).json({ success: false, detail: 'User exists' });
    
    const user = { id: nextId++, name, email, password: await bcrypt.hash(password, 10) };
    users.push(user);
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'secret');
    res.json({ success: true, access_token: token, user: { id: user.id, name, email } });
};

const handleLogin = async (req, res) => {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email);
    if (!user || !await bcrypt.compare(password, user.password)) {
        return res.status(401).json({ success: false, detail: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'secret');
    res.json({ success: true, access_token: token, user: { id: user.id, name: user.name, email } });
};

// Multiple endpoints for compatibility
app.post('/api/auth/register', handleRegister);
app.post('/api/register', handleRegister);
app.post('/api/auth/login', handleLogin);
app.post('/api/login', handleLogin);

// University routes
app.post('/api/university/branches', auth, (req, res) => {
    const { name, code } = req.body;
    if (!name || !code) return res.status(400).json({ success: false, message: 'Name and code required' });
    const branch = { id: nextId++, name, code };
    branches.push(branch);
    res.json({ success: true, data: branch });
});

app.get('/api/university/branches', auth, (req, res) => {
    res.json({ success: true, data: branches });
});

app.post('/api/university/sections', auth, (req, res) => {
    const { name, year, semester, branch_id, strength } = req.body;
    if (!name || !year || !semester) return res.status(400).json({ success: false, message: 'Name, year, semester required' });
    const section = { id: nextId++, name, year, semester, branch_id, strength: strength || 60 };
    sections.push(section);
    res.json({ success: true, data: section });
});

app.get('/api/university/sections', auth, (req, res) => {
    res.json({ success: true, data: sections });
});

// Delete a section
app.delete('/api/university/sections/:id', auth, (req, res) => {
    const sectionId = parseInt(req.params.id);
    const sectionIndex = sections.findIndex(s => s.id === sectionId);
    
    if (sectionIndex === -1) {
        return res.status(404).json({ success: false, message: 'Section not found' });
    }
    
    // Remove the section
    sections.splice(sectionIndex, 1);
    
    // Also remove any timetables associated with this section
    delete timetables[sectionId];
    
    res.status(200).json({ success: true, message: 'Section deleted successfully' });
});

app.post('/api/university/teachers', auth, (req, res) => {
    const { name, employee_id, department, max_hours_per_day } = req.body;
    if (!name || !employee_id) return res.status(400).json({ success: false, message: 'Name and employee_id required' });
    if (teachers.find(t => t.employee_id === employee_id)) return res.status(400).json({ success: false, message: 'Teacher exists' });
    const teacher = { id: nextId++, name, employee_id, department: department || 'General', max_hours_per_day: max_hours_per_day || 6 };
    teachers.push(teacher);
    res.json({ success: true, data: teacher });
});

app.get('/api/university/teachers', auth, (req, res) => {
    res.json({ success: true, data: teachers });
});

app.post('/api/university/rooms', auth, (req, res) => {
    const { number, building, capacity, room_type } = req.body;
    if (!number || !building) return res.status(400).json({ success: false, message: 'Number and building required' });
    const room = { id: nextId++, number, building, capacity: capacity || 60, room_type: room_type || 'classroom' };
    rooms.push(room);
    res.json({ success: true, data: room });
});

app.get('/api/university/rooms', auth, (req, res) => {
    res.json({ success: true, data: rooms });
});

app.post('/api/university/subjects', auth, (req, res) => {
    const { name, code, credits, subject_type, hours_per_week } = req.body;
    if (!name || !code) return res.status(400).json({ success: false, message: 'Name and code required' });
    const subject = { id: nextId++, name, code, credits: credits || 3, subject_type: subject_type || 'theory', hours_per_week: hours_per_week || 4 };
    subjects.push(subject);
    res.json({ success: true, data: subject });
});

app.get('/api/university/subjects', auth, (req, res) => {
    res.json({ success: true, data: subjects });
});

app.post('/api/university/courses', auth, (req, res) => {
    const { section_id, subject_id, teacher_id, room_id } = req.body;
    if (!section_id || !subject_id || !teacher_id) return res.status(400).json({ success: false, message: 'Section, subject, teacher required' });
    
    const section = sections.find(s => s.id === section_id);
    const subject = subjects.find(s => s.id === subject_id);
    const teacher = teachers.find(t => t.id === teacher_id);
    const room = rooms.find(r => r.id === room_id);
    
    const course = {
        id: nextId++, section_id, subject_id, teacher_id, room_id,
        section_name: section?.name, subject_name: subject?.name, subject_code: subject?.code,
        teacher_name: teacher?.name, room_number: room?.number, building: room?.building
    };
    courses.push(course);
    res.json({ success: true, data: course });
});

app.get('/api/university/courses', auth, (req, res) => {
    res.json({ success: true, data: courses });
});

// Enhanced timetable generation endpoint
app.post('/api/university/timetables/generate', auth, (req, res) => {
    try {
        const { section_id } = req.body;
        if (!section_id) {
            return res.status(400).json({ 
                success: false, 
                message: 'Section ID is required' 
            });
        }
        
        const section = sections.find(s => s.id === section_id);
        if (!section) {
            return res.status(404).json({ 
                success: false, 
                message: 'Section not found' 
            });
        }
        
        const sectionCourses = courses.filter(c => c.section_id === section_id);
        if (!sectionCourses.length) {
            return res.status(400).json({ 
                success: false, 
                message: 'No courses found for this section' 
            });
        }
        
        // Define time slots and days
        const timeSlots = [
            '09:00-10:00', '10:00-11:00', '11:00-12:00', 
            '12:00-13:00', '14:00-15:00', '15:00-16:00', '16:00-17:00'
        ];
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
        
        // Generate timetable slots
        const slots = [];
        const teacherSlots = {};
        const roomSlots = {};
        const conflicts = [];
        
        days.forEach(day => {
            timeSlots.forEach((timeSlot, slotIndex) => {
                const [startTime, endTime] = timeSlot.split('-');
                const availableCourses = sectionCourses.filter(course => {
                    // Check if course is already scheduled for this day
                    const alreadyScheduled = slots.some(slot => 
                        slot.day === day && 
                        slot.course_id === course.id
                    );
                    return !alreadyScheduled;
                });
                
                if (availableCourses.length > 0) {
                    const course = availableCourses[0];
                    const slot = {
                        id: `${day}-${slotIndex}`,
                        day,
                        start_time: startTime,
                        end_time: endTime,
                        course_id: course.id,
                        subject_code: course.subject_code,
                        subject_name: course.subject_name,
                        teacher_id: course.teacher_id,
                        teacher_name: course.teacher_name,
                        room_id: course.room_id,
                        room_number: course.room_number
                    };
                    
                    // Check for teacher conflicts
                    const teacherKey = `${day}-${timeSlot}-${course.teacher_id}`;
                    if (teacherSlots[teacherKey]) {
                        conflicts.push({
                            type: 'teacher',
                            message: `Teacher ${course.teacher_name} is already scheduled at ${day} ${timeSlot}`,
                            details: {
                                day,
                                time: timeSlot,
                                teacher: course.teacher_name,
                                course: course.subject_name
                            }
                        });
                    } else {
                        teacherSlots[teacherKey] = true;
                    }
                    
                    // Check for room conflicts
                    const roomKey = `${day}-${timeSlot}-${course.room_id}`;
                    if (roomSlots[roomKey]) {
                        conflicts.push({
                            type: 'room',
                            message: `Room ${course.room_number} is already booked at ${day} ${timeSlot}`,
                            details: {
                                day,
                                time: timeSlot,
                                room: course.room_number,
                                course: course.subject_name
                            }
                        });
                    } else {
                        roomSlots[roomKey] = true;
                    }
                    
                    slots.push(slot);
                }
            });
        });
        
        // Save the generated timetable
        const timetable = { 
            id: `timetable-${section_id}-${Date.now()}`,
            section_id,
            section_name: section.name,
            generated_at: new Date().toISOString(),
            days,
            time_slots: timeSlots,
            slots,
            conflicts: {
                total: conflicts.length,
                list: conflicts
            }
        };
        
        timetables[timetable.id] = timetable;
        
        res.json({ 
            success: true, 
            data: timetable,
            message: conflicts.length > 0 
                ? 'Timetable generated with some conflicts' 
                : 'Timetable generated successfully'
        });
        
    } catch (error) {
        console.error('Error generating timetable:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to generate timetable',
            error: error.message 
        });
    }
});

// Get timetable for a section
app.get('/api/university/sections/:sectionId/timetable', auth, (req, res) => {
    try {
        const { sectionId } = req.params;
        const section = sections.find(s => s.id === parseInt(sectionId));
        
        if (!section) {
            return res.status(404).json({ 
                success: false, 
                message: 'Section not found' 
            });
        }
        
        // Find all timetables for this section (most recent first)
        const sectionTimetables = Object.values(timetables)
            .filter(t => t.section_id === parseInt(sectionId))
            .sort((a, b) => new Date(b.generated_at) - new Date(a.generated_at));
        
        if (sectionTimetables.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'No timetables found for this section' 
            });
        }
        
        res.json({ 
            success: true, 
            data: sectionTimetables[0] // Return most recent timetable
        });
        
    } catch (error) {
        console.error('Error fetching timetable:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to fetch timetable',
            error: error.message 
        });
    }
});

// Get all timetables
app.get('/api/university/timetables', auth, (req, res) => {
    try {
        const allTimetables = Object.values(timetables).map(timetable => ({
            id: timetable.id,
            section_id: timetable.section_id,
            section_name: timetable.section_name,
            generated_at: timetable.generated_at,
            total_slots: timetable.slots ? timetable.slots.length : 0,
            conflicts: timetable.conflicts ? timetable.conflicts.total : 0
        }));
        
        res.json({ 
            success: true, 
            data: allTimetables 
        });
        
    } catch (error) {
        console.error('Error fetching timetables:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to fetch timetables',
            error: error.message 
        });
    }
});

// Compatibility routes
app.get('/api/sections', auth, (req, res) => res.json({ success: true, data: sections }));
app.post('/api/sections', auth, (req, res) => {
    const { name, year, semester } = req.body;
    const section = { id: nextId++, name, year: year || 1, semester: semester || 1 };
    sections.push(section);
    res.json({ success: true, data: section });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'AI Timetable Generator Server running', 
        data: { 
            users: users.length, 
            sections: sections.length,
            teachers: teachers.length,
            rooms: rooms.length,
            subjects: subjects.length,
            courses: courses.length
        },
        endpoints: [
            'GET /api/health',
            'POST /api/register',
            'POST /api/login',
            'GET /api/university/teachers',
            'POST /api/university/teachers',
            'GET /api/university/rooms', 
            'POST /api/university/rooms',
            'GET /api/university/subjects',
            'POST /api/university/subjects'
        ]
    });
});

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));