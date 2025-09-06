class UniversityTimetableManager {
    constructor() {
        this.baseUrl = 'http://localhost:3000/api/university';
        this.token = localStorage.getItem('token');
        this.branches = [];
        this.sections = [];
        this.teachers = [];
        this.rooms = [];
        this.subjects = [];
        this.courses = [];
        this.currentStep = 1;
        this.init();
    }

    getHeaders() {
        return {
            'Content-Type': 'application/json',
            ...(this.token && { 'Authorization': `Bearer ${this.token}` })
        };
    }

    async init() {
        this.setupEventListeners();
        await this.loadInitialData();
        this.showStep(1);
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.next-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const nextStep = parseInt(e.target.dataset.next);
                if (this.validateStep(this.currentStep)) {
                    this.showStep(nextStep);
                }
            });
        });

        document.querySelectorAll('.prev-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const prevStep = parseInt(e.target.dataset.prev);
                this.showStep(prevStep);
            });
        });

        // Entity creation
        document.getElementById('createBranchBtn')?.addEventListener('click', () => this.createBranch());
        document.getElementById('createSectionBtn')?.addEventListener('click', () => this.createSection());
        document.getElementById('createTeacherBtn')?.addEventListener('click', () => this.createTeacher());
        document.getElementById('createRoomBtn')?.addEventListener('click', () => this.createRoom());
        document.getElementById('createSubjectBtn')?.addEventListener('click', () => this.createSubject());
        document.getElementById('createCourseBtn')?.addEventListener('click', () => this.createCourse());
        document.getElementById('generateUniversityTimetableBtn')?.addEventListener('click', () => this.generateTimetable());
    }

    showStep(stepNumber) {
        document.querySelectorAll('.form-step').forEach(step => {
            step.classList.remove('active');
        });

        document.getElementById(`step${stepNumber}`)?.classList.add('active');

        document.querySelectorAll('.step').forEach((step, index) => {
            if (index < stepNumber) {
                step.classList.add('completed');
                step.classList.remove('active');
            } else if (index === stepNumber - 1) {
                step.classList.add('active');
                step.classList.remove('completed');
            } else {
                step.classList.remove('active', 'completed');
            }
        });

        this.currentStep = stepNumber;
    }

    validateStep(stepNumber) {
        switch (stepNumber) {
            case 1:
                return this.branches.length > 0;
            case 2:
                return this.sections.length > 0;
            case 3:
                return this.teachers.length > 0 && this.rooms.length > 0 && this.subjects.length > 0;
            case 4:
                return this.courses.length > 0;
            default:
                return true;
        }
    }

    async loadInitialData() {
        // Load existing data if any
        try {
            await Promise.all([
                this.loadBranches(),
                this.loadSections(),
                this.loadTeachers(),
                this.loadRooms(),
                this.loadSubjects()
            ]);
        } catch (error) {
            console.error('Error loading initial data:', error);
        }
    }

    async createBranch() {
        const name = document.getElementById('branchName')?.value.trim();
        const code = document.getElementById('branchCode')?.value.trim();

        if (!name || !code) {
            this.showMessage('Please enter branch name and code', 'error');
            return;
        }

        try {
            const response = await fetch(`${this.baseUrl}/branches`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify({ name, code })
            });

            const data = await response.json();
            if (data.success) {
                this.branches.push(data.data);
                this.updateBranchesDisplay();
                this.updateBranchDropdowns();
                document.getElementById('branchName').value = '';
                document.getElementById('branchCode').value = '';
                this.showMessage('Branch created successfully', 'success');
            } else {
                this.showMessage(data.message || 'Failed to create branch', 'error');
            }
        } catch (error) {
            this.showMessage('Error creating branch', 'error');
        }
    }

    async createSection() {
        const name = document.getElementById('sectionName')?.value.trim();
        const year = parseInt(document.getElementById('sectionYear')?.value);
        const semester = parseInt(document.getElementById('sectionSemester')?.value);
        const branchId = parseInt(document.getElementById('sectionBranch')?.value);
        const strength = parseInt(document.getElementById('sectionStrength')?.value) || 60;

        if (!name || !year || !semester || !branchId) {
            this.showMessage('Please fill all section details', 'error');
            return;
        }

        try {
            const response = await fetch(`${this.baseUrl}/sections`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify({
                    name, year, semester, branch_id: branchId, strength
                })
            });

            const data = await response.json();
            if (data.success) {
                this.sections.push(data.data);
                this.updateSectionsDisplay();
                this.updateSectionDropdowns();
                this.clearSectionForm();
                this.showMessage('Section created successfully', 'success');
            } else {
                this.showMessage(data.message || 'Failed to create section', 'error');
            }
        } catch (error) {
            this.showMessage('Error creating section', 'error');
        }
    }

    async createTeacher() {
        const name = document.getElementById('teacherName')?.value.trim();
        const employeeId = document.getElementById('teacherEmployeeId')?.value.trim();
        const department = document.getElementById('teacherDepartment')?.value.trim();
        const maxHours = parseInt(document.getElementById('teacherMaxHours')?.value) || 6;

        if (!name || !employeeId || !department) {
            this.showMessage('Please fill all teacher details', 'error');
            return;
        }

        try {
            const response = await fetch(`${this.baseUrl}/teachers`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify({
                    name, employee_id: employeeId, department, max_hours_per_day: maxHours
                })
            });

            const data = await response.json();
            if (data.success) {
                this.teachers.push(data.data);
                this.updateTeachersDisplay();
                this.updateTeacherDropdowns();
                this.clearTeacherForm();
                this.showMessage('Teacher created successfully', 'success');
            } else {
                this.showMessage(data.message || 'Failed to create teacher', 'error');
            }
        } catch (error) {
            this.showMessage('Error creating teacher', 'error');
        }
    }

    async createRoom() {
        const number = document.getElementById('roomNumber')?.value.trim();
        const building = document.getElementById('roomBuilding')?.value.trim();
        const capacity = parseInt(document.getElementById('roomCapacity')?.value) || 60;
        const roomType = document.getElementById('roomType')?.value || 'classroom';

        if (!number || !building) {
            this.showMessage('Please enter room number and building', 'error');
            return;
        }

        try {
            const response = await fetch(`${this.baseUrl}/rooms`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify({
                    number, building, capacity, room_type: roomType
                })
            });

            const data = await response.json();
            if (data.success) {
                this.rooms.push(data.data);
                this.updateRoomsDisplay();
                this.updateRoomDropdowns();
                this.clearRoomForm();
                this.showMessage('Room created successfully', 'success');
            } else {
                this.showMessage(data.message || 'Failed to create room', 'error');
            }
        } catch (error) {
            this.showMessage('Error creating room', 'error');
        }
    }

    async createSubject() {
        const name = document.getElementById('subjectName')?.value.trim();
        const code = document.getElementById('subjectCode')?.value.trim();
        const credits = parseInt(document.getElementById('subjectCredits')?.value) || 3;
        const subjectType = document.getElementById('subjectType')?.value || 'theory';
        const hoursPerWeek = parseInt(document.getElementById('subjectHours')?.value) || 3;

        if (!name || !code) {
            this.showMessage('Please enter subject name and code', 'error');
            return;
        }

        try {
            const response = await fetch(`${this.baseUrl}/subjects`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify({
                    name, code, credits, subject_type: subjectType, hours_per_week: hoursPerWeek
                })
            });

            const data = await response.json();
            if (data.success) {
                this.subjects.push(data.data);
                this.updateSubjectsDisplay();
                this.updateSubjectDropdowns();
                this.clearSubjectForm();
                this.showMessage('Subject created successfully', 'success');
            } else {
                this.showMessage(data.message || 'Failed to create subject', 'error');
            }
        } catch (error) {
            this.showMessage('Error creating subject', 'error');
        }
    }

    async createCourse() {
        const sectionId = parseInt(document.getElementById('courseSectionId')?.value);
        const subjectId = parseInt(document.getElementById('courseSubjectId')?.value);
        const teacherId = parseInt(document.getElementById('courseTeacherId')?.value);
        const roomId = parseInt(document.getElementById('courseRoomId')?.value) || null;

        if (!sectionId || !subjectId || !teacherId) {
            this.showMessage('Please select section, subject, and teacher', 'error');
            return;
        }

        try {
            const response = await fetch(`${this.baseUrl}/courses`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify({
                    section_id: sectionId, subject_id: subjectId, teacher_id: teacherId, room_id: roomId
                })
            });

            const data = await response.json();
            if (data.success) {
                this.courses.push(data.data);
                this.updateCoursesDisplay();
                this.clearCourseForm();
                this.showMessage('Course created successfully', 'success');
            } else {
                this.showMessage(data.message || 'Failed to create course', 'error');
            }
        } catch (error) {
            this.showMessage('Error creating course', 'error');
        }
    }

    async generateTimetable() {
        const sectionId = parseInt(document.getElementById('timetableSectionId')?.value);
        if (!sectionId) {
            this.showMessage('Please select a section', 'error');
            return;
        }

        const config = {
            section_id: sectionId,
            start_time: document.getElementById('startTime')?.value || '09:00',
            end_time: document.getElementById('endTime')?.value || '16:00',
            period_duration: parseInt(document.getElementById('periodDuration')?.value) || 50,
            break_duration: parseInt(document.getElementById('breakDuration')?.value) || 10,
            lunch_start: document.getElementById('lunchStart')?.value || '12:30',
            lunch_duration: parseInt(document.getElementById('lunchDuration')?.value) || 45,
            working_days: Array.from(document.querySelectorAll('input[name="workingDays"]:checked')).map(cb => cb.value)
        };

        try {
            const response = await fetch(`${this.baseUrl}/timetables/generate`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(config)
            });

            const data = await response.json();
            if (data.success) {
                await this.displayTimetable(sectionId);
                this.showMessage('Timetable generated successfully!', 'success');
                
                if (data.data.conflicts.total_conflicts > 0) {
                    this.showConflicts(data.data.conflicts.conflicts);
                }
            } else {
                this.showMessage(data.message || 'Failed to generate timetable', 'error');
            }
        } catch (error) {
            this.showMessage('Error generating timetable', 'error');
        }
    }

    async displayTimetable(sectionId) {
        try {
            const response = await fetch(`${this.baseUrl}/sections/${sectionId}/timetable`, {
                headers: this.getHeaders()
            });

            const data = await response.json();
            if (data.success) {
                this.renderUniversityTimetable(data.data);
            }
        } catch (error) {
            console.error('Error displaying timetable:', error);
        }
    }

    renderUniversityTimetable(timetableData) {
        const container = document.getElementById('timetableContainer');
        if (!container) return;

        const workingDays = timetableData.working_days;
        const slots = timetableData.slots;

        let html = `
            <div class="timetable-header-info">
                <h3>${timetableData.name}</h3>
                <p><strong>Branch:</strong> ${timetableData.section.branch} | 
                   <strong>Year:</strong> ${timetableData.section.year} | 
                   <strong>Semester:</strong> ${timetableData.section.semester}</p>
            </div>
            <div class="university-timetable-grid">
                <div class="time-header">Time</div>
        `;

        workingDays.forEach(day => {
            html += `<div class="day-header">${day}</div>`;
        });

        // Get all unique time slots
        const timeSlots = new Set();
        Object.values(slots).forEach(daySlots => {
            daySlots.forEach(slot => {
                timeSlots.add(`${slot.start_time}-${slot.end_time}`);
            });
        });

        const sortedTimeSlots = Array.from(timeSlots).sort();

        sortedTimeSlots.forEach(timeSlot => {
            html += `<div class="time-slot">${timeSlot}</div>`;
            
            workingDays.forEach(day => {
                const daySlots = slots[day] || [];
                const slot = daySlots.find(s => `${s.start_time}-${s.end_time}` === timeSlot);
                
                if (slot) {
                    if (slot.is_break) {
                        html += `<div class="break-slot">${slot.break_type === 'lunch' ? 'Lunch Break' : 'Break'}</div>`;
                    } else {
                        const bgColor = this.getSubjectColor(slot.subject_code);
                        html += `
                            <div class="course-slot" style="background-color: ${bgColor}20; border-left: 4px solid ${bgColor}">
                                <div class="course-code">${slot.subject_code}</div>
                                <div class="course-name">${slot.subject_name}</div>
                                <div class="course-teacher">${slot.teacher_name}</div>
                                <div class="course-room">${slot.room_number} - ${slot.building}</div>
                                <div class="course-type">${slot.subject_type}</div>
                            </div>
                        `;
                    }
                } else {
                    html += `<div class="empty-slot">-</div>`;
                }
            });
        });

        html += `</div>`;
        container.innerHTML = html;
    }

    getSubjectColor(subjectCode) {
        const colors = ['#3f51b5', '#4caf50', '#ff9800', '#f44336', '#9c27b0', '#00bcd4', '#795548'];
        const hash = subjectCode.split('').reduce((a, b) => {
            a = ((a << 5) - a) + b.charCodeAt(0);
            return a & a;
        }, 0);
        return colors[Math.abs(hash) % colors.length];
    }

    showConflicts(conflicts) {
        const conflictHtml = `
            <div class="conflicts-panel">
                <h4>Scheduling Conflicts Detected:</h4>
                <ul>
                    ${conflicts.map(conflict => `<li>${conflict}</li>`).join('')}
                </ul>
            </div>
        `;
        
        const container = document.getElementById('conflictsContainer');
        if (container) {
            container.innerHTML = conflictHtml;
            container.style.display = 'block';
        }
    }

    updateBranchesDisplay() {
        const container = document.getElementById('branchesDisplay');
        if (container) {
            container.innerHTML = this.branches.map(branch => 
                `<div class="entity-item">${branch.name} (${branch.code})</div>`
            ).join('');
        }
    }

    updateBranchDropdowns() {
        const selects = document.querySelectorAll('.branch-select');
        selects.forEach(select => {
            select.innerHTML = '<option value="">Select Branch</option>' +
                this.branches.map(branch => 
                    `<option value="${branch.id}">${branch.name}</option>`
                ).join('');
        });
    }

    // Similar update methods for other entities...
    updateSectionsDisplay() {
        const container = document.getElementById('sectionsDisplay');
        if (container) {
            container.innerHTML = this.sections.map(section => 
                `<div class="entity-item">${section.branch_name} ${section.year}-${section.name} Sem-${section.semester}</div>`
            ).join('');
        }
    }

    updateSectionDropdowns() {
        const selects = document.querySelectorAll('.section-select');
        selects.forEach(select => {
            select.innerHTML = '<option value="">Select Section</option>' +
                this.sections.map(section => 
                    `<option value="${section.id}">${section.branch_name} ${section.year}-${section.name}</option>`
                ).join('');
        });
    }

    // Clear form methods
    clearSectionForm() {
        ['sectionName', 'sectionYear', 'sectionSemester', 'sectionBranch', 'sectionStrength'].forEach(id => {
            const element = document.getElementById(id);
            if (element) element.value = '';
        });
    }

    clearTeacherForm() {
        ['teacherName', 'teacherEmployeeId', 'teacherDepartment', 'teacherMaxHours'].forEach(id => {
            const element = document.getElementById(id);
            if (element) element.value = '';
        });
    }

    clearRoomForm() {
        ['roomNumber', 'roomBuilding', 'roomCapacity', 'roomType'].forEach(id => {
            const element = document.getElementById(id);
            if (element) element.value = '';
        });
    }

    clearSubjectForm() {
        ['subjectName', 'subjectCode', 'subjectCredits', 'subjectType', 'subjectHours'].forEach(id => {
            const element = document.getElementById(id);
            if (element) element.value = '';
        });
    }

    clearCourseForm() {
        ['courseSectionId', 'courseSubjectId', 'courseTeacherId', 'courseRoomId'].forEach(id => {
            const element = document.getElementById(id);
            if (element) element.value = '';
        });
    }

    showMessage(message, type = 'info') {
        let messageEl = document.getElementById('messageContainer');
        if (!messageEl) {
            messageEl = document.createElement('div');
            messageEl.id = 'messageContainer';
            messageEl.style.cssText = `
                position: fixed; top: 20px; right: 20px; padding: 15px 20px;
                border-radius: 5px; color: white; font-weight: 500; z-index: 1000;
                max-width: 300px;
            `;
            document.body.appendChild(messageEl);
        }

        messageEl.textContent = message;
        const colors = { success: '#2ecc71', error: '#e74c3c', info: '#3498db', warning: '#f39c12' };
        messageEl.style.backgroundColor = colors[type] || colors.info;
        messageEl.style.display = 'block';

        setTimeout(() => messageEl.style.display = 'none', 3000);
    }

    // Placeholder methods for loading existing data
    async loadBranches() { /* Implementation */ }
    async loadSections() { /* Implementation */ }
    async loadTeachers() { /* Implementation */ }
    async loadRooms() { /* Implementation */ }
    async loadSubjects() { /* Implementation */ }
}

document.addEventListener('DOMContentLoaded', () => {
    window.universityTimetableManager = new UniversityTimetableManager();
});