const mongoose = require('mongoose');

// User Schema
const userSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, minlength: 6 }
}, { timestamps: true });

// Branch Schema
const branchSchema = new mongoose.Schema({
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true }
});

// Section Schema
const sectionSchema = new mongoose.Schema({
    name: { type: String, required: true },
    year: { type: Number, required: true },
    semester: { type: Number, required: true },
    branch_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch' },
    strength: { type: Number, default: 60 }
});

// Teacher Schema
const teacherSchema = new mongoose.Schema({
    name: { type: String, required: true },
    employee_id: { type: String, required: true, unique: true },
    department: { type: String, default: 'General' },
    max_hours_per_day: { type: Number, default: 6 }
});

// Room Schema
const roomSchema = new mongoose.Schema({
    number: { type: String, required: true },
    building: { type: String, required: true },
    capacity: { type: Number, default: 60 },
    room_type: { type: String, default: 'classroom' }
});

// Subject Schema
const subjectSchema = new mongoose.Schema({
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    credits: { type: Number, default: 3 },
    subject_type: { type: String, default: 'theory' },
    hours_per_week: { type: Number, default: 4 }
});

// Course Schema
const courseSchema = new mongoose.Schema({
    section_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Section', required: true },
    subject_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
    teacher_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true },
    room_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Room' }
});

// Timetable Schema
const timetableSchema = new mongoose.Schema({
    section_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Section', required: true },
    name: { type: String, required: true },
    working_days: [String],
    slots: { type: mongoose.Schema.Types.Mixed }
}, { timestamps: true });

module.exports = {
    User: mongoose.model('User', userSchema),
    Branch: mongoose.model('Branch', branchSchema),
    Section: mongoose.model('Section', sectionSchema),
    Teacher: mongoose.model('Teacher', teacherSchema),
    Room: mongoose.model('Room', roomSchema),
    Subject: mongoose.model('Subject', subjectSchema),
    Course: mongoose.model('Course', courseSchema),
    Timetable: mongoose.model('Timetable', timetableSchema)
};