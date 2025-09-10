const express = require('express');
const router = express.Router();

// In-memory storage
let branches = [];
let sections = [];
let teachers = [];
let rooms = [];
let subjects = [];
let courses = [];
let timetables = {};
let nextId = 1;

// Branches
router.post('/branches', (req, res) => {
    const { name, code } = req.body;
    if (!name || !code) {
        return res.status(400).json({ success: false, message: 'Name and code are required' });
    }
    const branch = { id: nextId++, name, code };
    branches.push(branch);
    res.json({ success: true, data: branch });
});

router.get('/branches', (req, res) => {
    res.json({ success: true, data: branches });
});

// Sections
router.post('/sections', (req, res) => {
    const { name, year, semester, branch_id, strength } = req.body;
    if (!name || !year || !semester) {
        return res.status(400).json({ success: false, message: 'Name, year, and semester are required' });
    }
    const branch = branches.find(b => b.id === branch_id);
    const section = { 
        id: nextId++, 
        name, 
        year, 
        semester, 
        branch_id, 
        strength: strength || 60,
        branch_name: branch ? branch.name : 'Unknown'
    };
    sections.push(section);
    res.json({ success: true, data: section });
});

router.get('/sections', (req, res) => {
    res.json({ success: true, data: sections });
});

// Teachers
router.post('/teachers', (req, res) => {
    const { name, employee_id, department, max_hours_per_day } = req.body;
    if (!name || !employee_id) {
        return res.status(400).json({ success: false, message: 'Name and employee ID are required' });
    }
    
    // Check for duplicate employee_id
    const existingTeacher = teachers.find(t => t.employee_id === employee_id);
    if (existingTeacher) {
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

router.get('/teachers', (req, res) => {
    res.json({ success: true, data: teachers });
});

// Rooms
router.post('/rooms', (req, res) => {
    const { number, building, capacity, room_type } = req.body;
    if (!number || !building) {
        return res.status(400).json({ success: false, message: 'Room number and building are required' });
    }
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

router.get('/rooms', (req, res) => {
    res.json({ success: true, data: rooms });
});

// Subjects
router.post('/subjects', (req, res) => {
    const { name, code, credits, subject_type, hours_per_week } = req.body;
    if (!name || !code) {
        return res.status(400).json({ success: false, message: 'Subject name and code are required' });
    }
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

router.get('/subjects', (req, res) => {
    res.json({ success: true, data: subjects });
});

// Courses
router.post('/courses', (req, res) => {
    const { section_id, subject_id, teacher_id, room_id } = req.body;
    if (!section_id || !subject_id || !teacher_id) {
        return res.status(400).json({ success: false, message: 'Section, subject, and teacher are required' });
    }
    
    const section = sections.find(s => s.id === section_id);
    const subject = subjects.find(s => s.id === subject_id);
    const teacher = teachers.find(t => t.id === teacher_id);
    const room = rooms.find(r => r.id === room_id);
    
    const course = { 
        id: nextId++, 
        section_id, 
        subject_id, 
        teacher_id, 
        room_id,
        section_name: section ? section.name : 'Unknown',
        subject_name: subject ? subject.name : 'Unknown',
        subject_code: subject ? subject.code : 'Unknown',
        teacher_name: teacher ? teacher.name : 'Unknown',
        room_number: room ? room.number : 'TBA',
        building: room ? room.building : 'TBA'
    };
    courses.push(course);
    res.json({ success: true, data: course });
});

router.get('/courses', (req, res) => {
    res.json({ success: true, data: courses });
});

// Get courses for a specific section
router.get('/sections/:id/courses', (req, res) => {
    const sectionId = parseInt(req.params.id);
    const sectionCourses = courses.filter(c => c.section_id === sectionId);
    res.json({ success: true, data: sectionCourses });
});

// Timetable generation
router.post('/timetables/generate', (req, res) => {
    const { section_id, start_time, end_time, break_duration, lunch_start, lunch_end } = req.body;
    
    if (!section_id) {
        return res.status(400).json({ success: false, message: 'Section ID is required' });
    }
    
    const section = sections.find(s => s.id === section_id);
    if (!section) {
        return res.status(404).json({ success: false, message: 'Section not found' });
    }

    // Get courses for this section
    const sectionCourses = courses.filter(c => c.section_id === section_id);
    
    if (sectionCourses.length === 0) {
        return res.status(400).json({ success: false, message: 'No courses found for this section. Please add courses first.' });
    }

    // Generate time slots
    const timeSlots = generateTimeSlots(start_time || '09:00', end_time || '17:00', break_duration || 60, lunch_start || '12:00', lunch_end || '13:00');
    
    // Simple timetable generation
    const slots = {};
    const workingDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    
    workingDays.forEach(day => {
        slots[day] = [];
        sectionCourses.slice(0, Math.min(timeSlots.length, sectionCourses.length)).forEach((course, index) => {
            if (timeSlots[index]) {
                slots[day].push({
                    start_time: timeSlots[index].start,
                    end_time: timeSlots[index].end,
                    subject_code: course.subject_code,
                    subject_name: course.subject_name,
                    teacher_name: course.teacher_name,
                    room_number: course.room_number,
                    building: course.building,
                    subject_type: 'theory'
                });
            }
        });
    });

    timetables[section_id] = {
        section_id,
        name: `${section.name} Timetable`,
        section: { 
            branch: section.branch_name, 
            year: section.year, 
            semester: section.semester,
            name: section.name
        },
        working_days: workingDays,
        slots
    };

    res.json({ 
        success: true, 
        data: { 
            timetable: timetables[section_id], 
            conflicts: { total_conflicts: 0, conflicts: [] } 
        } 
    });
});

// Helper function to generate time slots
function generateTimeSlots(startTime, endTime, breakDuration, lunchStart, lunchEnd) {
    const slots = [];
    const start = parseTime(startTime);
    const end = parseTime(endTime);
    const lunchStartTime = parseTime(lunchStart);
    const lunchEndTime = parseTime(lunchEnd);
    
    let current = start;
    const slotDuration = 60; // 1 hour slots
    
    while (current + slotDuration <= end) {
        const slotEnd = current + slotDuration;
        
        // Skip lunch time
        if (!(current >= lunchStartTime && current < lunchEndTime)) {
            slots.push({
                start: formatTime(current),
                end: formatTime(slotEnd)
            });
        }
        
        current = slotEnd;
        
        // Skip lunch break
        if (current === lunchStartTime) {
            current = lunchEndTime;
        }
    }
    
    return slots;
}

function parseTime(timeStr) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
}

function formatTime(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

// Get timetable
router.get('/sections/:id/timetable', (req, res) => {
    const sectionId = parseInt(req.params.id);
    const timetable = timetables[sectionId];
    
    if (!timetable) {
        return res.status(404).json({ success: false, message: 'Timetable not found for this section' });
    }
    
    res.json({ success: true, data: timetable });
});

// Health check endpoint
router.get('/health', (req, res) => {
    res.json({ 
        success: true, 
        message: 'University API is healthy',
        data: {
            branches: branches.length,
            sections: sections.length,
            teachers: teachers.length,
            rooms: rooms.length,
            subjects: subjects.length,
            courses: courses.length,
            timetables: Object.keys(timetables).length
        }
    });
});

// Get all timetables
router.get('/timetables', (req, res) => {
    res.json({ success: true, data: Object.values(timetables) });
});

// Delete endpoints
router.delete('/branches/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const index = branches.findIndex(b => b.id === id);
    if (index === -1) {
        return res.status(404).json({ success: false, message: 'Branch not found' });
    }
    branches.splice(index, 1);
    res.json({ success: true, message: 'Branch deleted successfully' });
});

router.delete('/sections/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const index = sections.findIndex(s => s.id === id);
    if (index === -1) {
        return res.status(404).json({ success: false, message: 'Section not found' });
    }
    sections.splice(index, 1);
    // Also remove related courses and timetables
    courses = courses.filter(c => c.section_id !== id);
    delete timetables[id];
    res.json({ success: true, message: 'Section deleted successfully' });
});

router.delete('/teachers/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const index = teachers.findIndex(t => t.id === id);
    if (index === -1) {
        return res.status(404).json({ success: false, message: 'Teacher not found' });
    }
    teachers.splice(index, 1);
    res.json({ success: true, message: 'Teacher deleted successfully' });
});

router.delete('/rooms/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const index = rooms.findIndex(r => r.id === id);
    if (index === -1) {
        return res.status(404).json({ success: false, message: 'Room not found' });
    }
    rooms.splice(index, 1);
    res.json({ success: true, message: 'Room deleted successfully' });
});

router.delete('/subjects/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const index = subjects.findIndex(s => s.id === id);
    if (index === -1) {
        return res.status(404).json({ success: false, message: 'Subject not found' });
    }
    subjects.splice(index, 1);
    res.json({ success: true, message: 'Subject deleted successfully' });
});

router.delete('/courses/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const index = courses.findIndex(c => c.id === id);
    if (index === -1) {
        return res.status(404).json({ success: false, message: 'Course not found' });
    }
    courses.splice(index, 1);
    res.json({ success: true, message: 'Course deleted successfully' });
});

module.exports = router;