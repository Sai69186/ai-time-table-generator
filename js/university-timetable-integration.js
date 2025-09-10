// University Timetable Integration with Backend API
class UniversityTimetableManager {
    constructor() {
        this.baseUrl = 'http://localhost:3000/api/university';
        this.data = {
            branches: [],
            sections: [],
            teachers: [],
            rooms: [],
            subjects: [],
            courses: []
        };
        this.init();
    }

    async init() {
        // Check authentication
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = 'login.html';
            return;
        }

        await this.loadAllData();
        this.setupEventListeners();
    }

    getHeaders() {
        const token = localStorage.getItem('token');
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };
    }

    async apiCall(endpoint, method = 'GET', data = null) {
        try {
            const config = {
                method,
                headers: this.getHeaders()
            };

            if (data) {
                config.body = JSON.stringify(data);
            }

            const response = await fetch(`${this.baseUrl}${endpoint}`, config);
            
            if (response.status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = 'login.html';
                return null;
            }

            return await response.json();
        } catch (error) {
            console.error('API call failed:', error);
            throw error;
        }
    }

    async loadAllData() {
        try {
            const [branches, sections, teachers, rooms, subjects, courses] = await Promise.all([
                this.apiCall('/branches'),
                this.apiCall('/sections'),
                this.apiCall('/teachers'),
                this.apiCall('/rooms'),
                this.apiCall('/subjects'),
                this.apiCall('/courses')
            ]);

            this.data.branches = branches?.data || [];
            this.data.sections = sections?.data || [];
            this.data.teachers = teachers?.data || [];
            this.data.rooms = rooms?.data || [];
            this.data.subjects = subjects?.data || [];
            this.data.courses = courses?.data || [];

            this.updateAllDisplays();
        } catch (error) {
            console.error('Error loading data:', error);
        }
    }

    setupEventListeners() {
        // Branch creation
        const createBranchBtn = document.getElementById('createBranchBtn');
        if (createBranchBtn) {
            createBranchBtn.addEventListener('click', () => this.createBranch());
        }

        // Section creation
        const createSectionBtn = document.getElementById('createSectionBtn');
        if (createSectionBtn) {
            createSectionBtn.addEventListener('click', () => this.createSection());
        }

        // Teacher creation
        const createTeacherBtn = document.getElementById('createTeacherBtn');
        if (createTeacherBtn) {
            createTeacherBtn.addEventListener('click', () => this.createTeacher());
        }

        // Room creation
        const createRoomBtn = document.getElementById('createRoomBtn');
        if (createRoomBtn) {
            createRoomBtn.addEventListener('click', () => this.createRoom());
        }

        // Subject creation
        const createSubjectBtn = document.getElementById('createSubjectBtn');
        if (createSubjectBtn) {
            createSubjectBtn.addEventListener('click', () => this.createSubject());
        }

        // Course creation
        const createCourseBtn = document.getElementById('createCourseBtn');
        if (createCourseBtn) {
            createCourseBtn.addEventListener('click', () => this.createCourse());
        }

        // Timetable generation
        const generateBtn = document.getElementById('generateUniversityTimetableBtn');
        if (generateBtn) {
            generateBtn.addEventListener('click', () => this.generateTimetable());
        }
    }

    async createBranch() {
        const name = document.getElementById('branchName')?.value.trim();
        const code = document.getElementById('branchCode')?.value.trim();

        if (!name || !code) {
            alert('Please fill in all branch details');
            return;
        }

        try {
            const response = await this.apiCall('/branches', 'POST', { name, code });
            
            if (response?.success) {
                this.data.branches.push(response.data);
                this.updateBranchesDisplay();
                this.updateBranchesDropdown();
                
                // Clear form
                document.getElementById('branchName').value = '';
                document.getElementById('branchCode').value = '';
                
                this.showSuccess('Branch created successfully!');
            } else {
                this.showError('Failed to create branch: ' + (response?.detail || 'Unknown error'));
            }
        } catch (error) {
            console.error('Error creating branch:', error);
            this.showError('Error creating branch. Please try again.');
        }
    }

    async createSection() {
        const name = document.getElementById('sectionName')?.value.trim();
        const year = parseInt(document.getElementById('sectionYear')?.value);
        const semester = parseInt(document.getElementById('sectionSemester')?.value);
        const branchId = parseInt(document.getElementById('sectionBranch')?.value);
        const strength = parseInt(document.getElementById('sectionStrength')?.value) || 60;

        if (!name || !branchId) {
            alert('Please fill in all required section details');
            return;
        }

        try {
            const response = await this.apiCall('/sections', 'POST', {
                name,
                year,
                semester,
                branch_id: branchId,
                strength
            });
            
            if (response?.success) {
                this.data.sections.push(response.data);
                this.updateSectionsDisplay();
                this.updateSectionsDropdown();
                
                // Clear form
                document.getElementById('sectionName').value = '';
                
                this.showSuccess('Section created successfully!');
            } else {
                this.showError('Failed to create section: ' + (response?.detail || 'Unknown error'));
            }
        } catch (error) {
            console.error('Error creating section:', error);
            this.showError('Error creating section. Please try again.');
        }
    }

    async createTeacher() {
        const name = document.getElementById('teacherName')?.value.trim();
        const employeeId = document.getElementById('teacherEmployeeId')?.value.trim();
        const department = document.getElementById('teacherDepartment')?.value.trim();
        const maxHours = parseInt(document.getElementById('teacherMaxHours')?.value) || 6;

        if (!name || !employeeId || !department) {
            alert('Please fill in all teacher details');
            return;
        }

        try {
            const response = await this.apiCall('/teachers', 'POST', {
                name,
                employee_id: employeeId,
                department,
                max_hours_per_day: maxHours
            });
            
            if (response?.success) {
                this.data.teachers.push(response.data);
                this.updateTeachersDisplay();
                this.updateTeachersDropdown();
                
                // Clear form
                document.getElementById('teacherName').value = '';
                document.getElementById('teacherEmployeeId').value = '';
                document.getElementById('teacherDepartment').value = '';
                
                this.showSuccess('Teacher created successfully!');
            } else {
                this.showError('Failed to create teacher: ' + (response?.detail || 'Unknown error'));
            }
        } catch (error) {
            console.error('Error creating teacher:', error);
            this.showError('Error creating teacher. Please try again.');
        }
    }

    async createRoom() {
        const number = document.getElementById('roomNumber')?.value.trim();
        const building = document.getElementById('roomBuilding')?.value.trim();
        const capacity = parseInt(document.getElementById('roomCapacity')?.value) || 60;
        const roomType = document.getElementById('roomType')?.value || 'classroom';

        if (!number || !building) {
            alert('Please fill in all room details');
            return;
        }

        try {
            const response = await this.apiCall('/rooms', 'POST', {
                number,
                building,
                capacity,
                room_type: roomType
            });
            
            if (response?.success) {
                this.data.rooms.push(response.data);
                this.updateRoomsDisplay();
                this.updateRoomsDropdown();
                
                // Clear form
                document.getElementById('roomNumber').value = '';
                document.getElementById('roomBuilding').value = '';
                
                this.showSuccess('Room created successfully!');
            } else {
                this.showError('Failed to create room: ' + (response?.detail || 'Unknown error'));
            }
        } catch (error) {
            console.error('Error creating room:', error);
            this.showError('Error creating room. Please try again.');
        }
    }

    async createSubject() {
        const name = document.getElementById('subjectName')?.value.trim();
        const code = document.getElementById('subjectCode')?.value.trim();
        const credits = parseInt(document.getElementById('subjectCredits')?.value) || 3;
        const subjectType = document.getElementById('subjectType')?.value || 'theory';
        const hours = parseInt(document.getElementById('subjectHours')?.value) || 3;

        if (!name || !code) {
            alert('Please fill in all subject details');
            return;
        }

        try {
            const response = await this.apiCall('/subjects', 'POST', {
                name,
                code,
                credits,
                subject_type: subjectType,
                hours_per_week: hours
            });
            
            if (response?.success) {
                this.data.subjects.push(response.data);
                this.updateSubjectsDisplay();
                this.updateSubjectsDropdown();
                
                // Clear form
                document.getElementById('subjectName').value = '';
                document.getElementById('subjectCode').value = '';
                
                this.showSuccess('Subject created successfully!');
            } else {
                this.showError('Failed to create subject: ' + (response?.detail || 'Unknown error'));
            }
        } catch (error) {
            console.error('Error creating subject:', error);
            this.showError('Error creating subject. Please try again.');
        }
    }

    async createCourse() {
        const sectionId = parseInt(document.getElementById('courseSectionId')?.value);
        const subjectId = parseInt(document.getElementById('courseSubjectId')?.value);
        const teacherId = parseInt(document.getElementById('courseTeacherId')?.value);
        const roomId = parseInt(document.getElementById('courseRoomId')?.value) || null;

        if (!sectionId || !subjectId || !teacherId) {
            alert('Please fill in all required course details');
            return;
        }

        try {
            const response = await this.apiCall('/courses', 'POST', {
                section_id: sectionId,
                subject_id: subjectId,
                teacher_id: teacherId,
                room_id: roomId
            });
            
            if (response?.success) {
                this.data.courses.push(response.data);
                this.updateCoursesDisplay();
                
                // Clear form
                document.getElementById('courseSectionId').value = '';
                document.getElementById('courseSubjectId').value = '';
                document.getElementById('courseTeacherId').value = '';
                document.getElementById('courseRoomId').value = '';
                
                this.showSuccess('Course created successfully!');
            } else {
                this.showError('Failed to create course: ' + (response?.detail || 'Unknown error'));
            }
        } catch (error) {
            console.error('Error creating course:', error);
            this.showError('Error creating course. Please try again.');
        }
    }

    async generateTimetable() {
        const sectionId = parseInt(document.getElementById('timetableSectionId')?.value);
        const startTime = document.getElementById('startTime')?.value || '09:00';
        const endTime = document.getElementById('endTime')?.value || '16:00';
        const periodDuration = parseInt(document.getElementById('periodDuration')?.value) || 50;
        const lunchStart = document.getElementById('lunchStart')?.value || '12:30';

        const workingDays = Array.from(document.querySelectorAll('input[name="workingDays"]:checked'))
            .map(cb => cb.value);

        if (!sectionId) {
            alert('Please select a section for timetable generation');
            return;
        }

        try {
            const response = await this.apiCall('/timetables/generate', 'POST', {
                section_id: sectionId,
                start_time: startTime,
                end_time: endTime,
                period_duration: periodDuration,
                lunch_start: lunchStart,
                working_days: workingDays
            });
            
            if (response?.success) {
                this.displayTimetable(response.data);
                this.showSuccess('Timetable generated successfully!');
            } else {
                this.showError('Failed to generate timetable: ' + (response?.detail || 'Unknown error'));
            }
        } catch (error) {
            console.error('Error generating timetable:', error);
            this.showError('Error generating timetable. Please try again.');
        }
    }

    displayTimetable(timetableData) {
        const container = document.getElementById('timetableContainer');
        if (!container) return;

        const courses = timetableData.courses || [];
        const config = timetableData.config || {};

        if (courses.length === 0) {
            container.innerHTML = `
                <div class="timetable-header-info">
                    <h3>No Courses Found</h3>
                    <p>Please add courses to this section before generating a timetable.</p>
                </div>
            `;
            return;
        }

        let html = `
            <div class="timetable-header-info">
                <h3>Generated University Timetable</h3>
                <p>Section ID: ${timetableData.section_id}</p>
                <p>Total Courses: ${courses.length}</p>
                <p>Working Days: ${config.working_days?.join(', ') || 'Mon-Fri'}</p>
                <p>Time: ${config.start_time || '09:00'} - ${config.end_time || '16:00'}</p>
            </div>
            <div class="university-timetable-grid">
                <div class="time-header">Time</div>
        `;

        // Add day headers
        const days = config.working_days || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
        days.forEach(day => {
            html += `<div class="day-header">${day}</div>`;
        });

        // Generate time slots
        const timeSlots = this.generateTimeSlots(config.start_time || '09:00', config.end_time || '16:00');

        timeSlots.forEach((timeSlot, slotIndex) => {
            html += `<div class="time-slot">${timeSlot}</div>`;

            days.forEach((day, dayIndex) => {
                // Simple scheduling algorithm
                const courseIndex = (slotIndex + dayIndex) % courses.length;
                const course = courses[courseIndex];

                if (timeSlot.includes('12:30') || timeSlot.includes('13:')) {
                    html += `<div class="break-slot">LUNCH BREAK</div>`;
                } else if (course && slotIndex < 6) { // Limit to 6 periods per day
                    html += `
                        <div class="course-slot">
                            <div class="course-code">${course.name}</div>
                            <div class="course-teacher">${course.teacher}</div>
                            <div class="course-room">${course.room || 'Room TBA'}</div>
                        </div>
                    `;
                } else {
                    html += `<div class="empty-slot">Free Period</div>`;
                }
            });
        });

        html += '</div>';
        container.innerHTML = html;
    }

    generateTimeSlots(startTime, endTime) {
        const slots = [];
        let current = this.parseTime(startTime);
        const end = this.parseTime(endTime);

        while (current < end - 50) {
            const next = current + 50; // 50 minutes
            slots.push(`${this.formatTime(current)}-${this.formatTime(next)}`);
            current = next + 10; // 10 minute break

            // Add lunch break
            if (current >= this.parseTime('12:30') && current <= this.parseTime('13:30')) {
                current = this.parseTime('13:30'); // Skip lunch time
            }
        }

        return slots;
    }

    parseTime(timeStr) {
        const [hours, minutes] = timeStr.split(':').map(Number);
        return hours * 60 + minutes;
    }

    formatTime(minutes) {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
    }

    updateAllDisplays() {
        this.updateBranchesDisplay();
        this.updateBranchesDropdown();
        this.updateSectionsDisplay();
        this.updateSectionsDropdown();
        this.updateTeachersDisplay();
        this.updateTeachersDropdown();
        this.updateRoomsDisplay();
        this.updateRoomsDropdown();
        this.updateSubjectsDisplay();
        this.updateSubjectsDropdown();
        this.updateCoursesDisplay();
    }

    updateBranchesDisplay() {
        const display = document.getElementById('branchesDisplay');
        if (!display) return;

        display.innerHTML = this.data.branches.map(branch => `
            <div class="entity-item">
                <strong>${branch.name}</strong> (${branch.code})
            </div>
        `).join('');
    }

    updateBranchesDropdown() {
        const selects = document.querySelectorAll('.branch-select, #sectionBranch');
        selects.forEach(select => {
            select.innerHTML = '<option value="">Select Branch</option>' + 
                this.data.branches.map(branch => 
                    `<option value="${branch.id}">${branch.name}</option>`
                ).join('');
        });
    }

    updateSectionsDisplay() {
        const display = document.getElementById('sectionsDisplay');
        if (!display) return;

        display.innerHTML = this.data.sections.map(section => `
            <div class="entity-item">
                <strong>${section.name}</strong> - Year ${section.year}, Semester ${section.semester}
            </div>
        `).join('');
    }

    updateSectionsDropdown() {
        const selects = document.querySelectorAll('.section-select, #courseSectionId, #timetableSectionId');
        selects.forEach(select => {
            select.innerHTML = '<option value="">Select Section</option>' + 
                this.data.sections.map(section => 
                    `<option value="${section.id}">${section.name} (Year ${section.year})</option>`
                ).join('');
        });
    }

    updateTeachersDisplay() {
        const display = document.getElementById('teachersDisplay');
        if (!display) return;

        display.innerHTML = this.data.teachers.map(teacher => `
            <div class="entity-item">
                <strong>${teacher.name}</strong> (${teacher.employee_id}) - ${teacher.department}
            </div>
        `).join('');
    }

    updateTeachersDropdown() {
        const select = document.getElementById('courseTeacherId');
        if (!select) return;

        select.innerHTML = '<option value="">Select Teacher</option>' + 
            this.data.teachers.map(teacher => 
                `<option value="${teacher.id}">${teacher.name}</option>`
            ).join('');
    }

    updateRoomsDisplay() {
        const display = document.getElementById('roomsDisplay');
        if (!display) return;

        display.innerHTML = this.data.rooms.map(room => `
            <div class="entity-item">
                <strong>Room ${room.number}</strong> - ${room.building} (Capacity: ${room.capacity})
            </div>
        `).join('');
    }

    updateRoomsDropdown() {
        const select = document.getElementById('courseRoomId');
        if (!select) return;

        select.innerHTML = '<option value="">Select Room</option>' + 
            this.data.rooms.map(room => 
                `<option value="${room.id}">Room ${room.number} - ${room.building}</option>`
            ).join('');
    }

    updateSubjectsDisplay() {
        const display = document.getElementById('subjectsDisplay');
        if (!display) return;

        display.innerHTML = this.data.subjects.map(subject => `
            <div class="entity-item">
                <strong>${subject.name}</strong> (${subject.code}) - ${subject.credits} credits
            </div>
        `).join('');
    }

    updateSubjectsDropdown() {
        const select = document.getElementById('courseSubjectId');
        if (!select) return;

        select.innerHTML = '<option value="">Select Subject</option>' + 
            this.data.subjects.map(subject => 
                `<option value="${subject.id}">${subject.name} (${subject.code})</option>`
            ).join('');
    }

    updateCoursesDisplay() {
        const display = document.getElementById('coursesDisplay');
        if (!display) return;

        display.innerHTML = this.data.courses.map((course, index) => `
            <div class="entity-item">
                <strong>Course ${index + 1}</strong> - Successfully assigned to section
            </div>
        `).join('');
    }

    showSuccess(message) {
        // Simple success notification
        const notification = document.createElement('div');
        notification.className = 'notification success';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #2ecc71;
            color: white;
            padding: 1rem;
            border-radius: 4px;
            z-index: 1000;
        `;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
    }

    showError(message) {
        // Simple error notification
        const notification = document.createElement('div');
        notification.className = 'notification error';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #e74c3c;
            color: white;
            padding: 1rem;
            border-radius: 4px;
            z-index: 1000;
        `;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 5000);
    }
}

// Initialize the timetable manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.universityTimetableManager = new UniversityTimetableManager();
});