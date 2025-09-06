class TimetableManager {
    constructor() {
        this.sections = [];
        this.courses = [];
        this.currentStep = 1;
        this.init();
    }

    async init() {
        await this.loadSections();
        this.setupEventListeners();
        this.updateUI();
    }

    setupEventListeners() {
        // Step navigation
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

        // Section management
        document.getElementById('addSectionBtn')?.addEventListener('click', () => this.addSection());
        
        // Course management
        document.getElementById('addCourseBtn')?.addEventListener('click', () => this.addCourse());
        document.getElementById('selectedSection')?.addEventListener('change', (e) => {
            this.loadSectionCourses(e.target.value);
        });

        // Timetable generation
        document.getElementById('generateTimetableBtn')?.addEventListener('click', () => this.generateTimetable());
        document.getElementById('saveTimetableBtn')?.addEventListener('click', () => this.saveTimetable());
    }

    showStep(stepNumber) {
        // Hide all steps
        document.querySelectorAll('.form-step').forEach(step => {
            step.classList.remove('active');
        });

        // Show current step
        document.getElementById(`step${stepNumber}`)?.classList.add('active');

        // Update progress bar
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
                const instituteName = document.getElementById('instituteName')?.value;
                const academicYear = document.getElementById('academicYear')?.value;
                const semester = document.getElementById('semester')?.value;
                
                if (!instituteName || !academicYear || !semester) {
                    this.showMessage('Please fill in all basic information fields', 'error');
                    return false;
                }
                return true;

            case 2:
                if (this.sections.length === 0) {
                    this.showMessage('Please add at least one section', 'error');
                    return false;
                }
                return true;

            case 3:
                if (this.courses.length === 0) {
                    this.showMessage('Please add at least one course', 'error');
                    return false;
                }
                return true;

            default:
                return true;
        }
    }

    async loadSections() {
        try {
            const response = await window.timetableAPI.getSections();
            if (response && response.success) {
                this.sections = response.data;
                this.updateSectionsList();
                this.updateSectionsDropdown();
            }
        } catch (error) {
            console.error('Error loading sections:', error);
        }
    }

    async addSection() {
        const sectionName = document.getElementById('sectionName')?.value.trim();
        if (!sectionName) {
            this.showMessage('Please enter a section name', 'error');
            return;
        }

        try {
            const response = await window.timetableAPI.createSection(sectionName, 1);
            if (response && response.success) {
                this.sections.push(response.data);
                this.updateSectionsList();
                this.updateSectionsDropdown();
                document.getElementById('sectionName').value = '';
                this.showMessage('Section added successfully', 'success');
            } else {
                this.showMessage(response?.message || 'Failed to add section', 'error');
            }
        } catch (error) {
            console.error('Error adding section:', error);
            this.showMessage('Error adding section', 'error');
        }
    }

    async removeSection(sectionId) {
        try {
            const response = await window.timetableAPI.deleteSection(sectionId);
            if (response && response.success) {
                this.sections = this.sections.filter(s => s.id !== sectionId);
                this.updateSectionsList();
                this.updateSectionsDropdown();
                this.showMessage('Section removed successfully', 'success');
            } else {
                this.showMessage('Failed to remove section', 'error');
            }
        } catch (error) {
            console.error('Error removing section:', error);
            this.showMessage('Error removing section', 'error');
        }
    }

    updateSectionsList() {
        const sectionsList = document.getElementById('sectionsList');
        if (!sectionsList) return;

        sectionsList.innerHTML = this.sections.map(section => `
            <div class="section-item">
                <span>${section.name}</span>
                <div class="actions">
                    <button class="btn danger" onclick="timetableManager.removeSection(${section.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    updateSectionsDropdown() {
        const select = document.getElementById('selectedSection');
        if (!select) return;

        select.innerHTML = '<option value="">Select a section</option>' + 
            this.sections.map(section => 
                `<option value="${section.id}">${section.name}</option>`
            ).join('');
    }

    async loadSectionCourses(sectionId) {
        if (!sectionId) return;

        try {
            const response = await window.timetableAPI.getSectionCourses(sectionId);
            if (response && response.success) {
                this.courses = response.data;
                this.updateCoursesList();
            }
        } catch (error) {
            console.error('Error loading courses:', error);
        }
    }

    async addCourse() {
        const sectionId = document.getElementById('selectedSection')?.value;
        const courseName = document.getElementById('courseName')?.value.trim();
        const courseCode = document.getElementById('courseCode')?.value.trim();
        const teacherName = document.getElementById('teacherName')?.value.trim();
        const duration = document.getElementById('courseDuration')?.value;

        if (!sectionId || !courseName || !courseCode || !teacherName) {
            this.showMessage('Please fill in all course details and select a section', 'error');
            return;
        }

        const courseData = {
            name: courseName,
            code: courseCode,
            teacher: teacherName,
            room: '',
            duration: parseInt(duration) || 1,
            color: '#3f51b5',
            section_id: parseInt(sectionId)
        };

        try {
            const response = await window.timetableAPI.createCourse(courseData);
            if (response && response.success) {
                this.courses.push(response.data);
                this.updateCoursesList();
                
                // Reset form
                document.getElementById('courseName').value = '';
                document.getElementById('courseCode').value = '';
                document.getElementById('teacherName').value = '';
                document.getElementById('courseDuration').value = '1';
                
                this.showMessage('Course added successfully', 'success');
            } else {
                this.showMessage(response?.message || 'Failed to add course', 'error');
            }
        } catch (error) {
            console.error('Error adding course:', error);
            this.showMessage('Error adding course', 'error');
        }
    }

    async removeCourse(courseId) {
        try {
            const response = await window.timetableAPI.deleteCourse(courseId);
            if (response && response.success) {
                this.courses = this.courses.filter(c => c.id !== courseId);
                this.updateCoursesList();
                this.showMessage('Course removed successfully', 'success');
            } else {
                this.showMessage('Failed to remove course', 'error');
            }
        } catch (error) {
            console.error('Error removing course:', error);
            this.showMessage('Error removing course', 'error');
        }
    }

    updateCoursesList() {
        const coursesList = document.getElementById('coursesList');
        if (!coursesList) return;

        coursesList.innerHTML = this.courses.map(course => {
            const section = this.sections.find(s => s.id === course.section_id);
            return `
                <div class="course-item">
                    <div>
                        <strong>${course.code}</strong> - ${course.name}<br>
                        <small>Teacher: ${course.teacher} | Duration: ${course.duration} hr(s) | Section: ${section ? section.name : 'N/A'}</small>
                    </div>
                    <div class="actions">
                        <button class="btn danger" onclick="timetableManager.removeCourse(${course.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    async generateTimetable() {
        const selectedSectionId = document.getElementById('selectedSection')?.value;
        if (!selectedSectionId) {
            this.showMessage('Please select a section to generate timetable', 'error');
            return;
        }

        const config = {
            section_id: parseInt(selectedSectionId),
            start_time: document.getElementById('collegeStartTime')?.value || '09:00',
            end_time: document.getElementById('collegeEndTime')?.value || '16:00',
            period_duration: parseInt(document.getElementById('periodDuration')?.value) || 50,
            break_duration: parseInt(document.getElementById('breakDuration')?.value) || 10,
            lunch_start: document.getElementById('lunchStartTime')?.value || '12:30',
            lunch_duration: parseInt(document.getElementById('lunchDuration')?.value) || 45,
            working_days: Array.from(document.querySelectorAll('input[name="workingDays"]:checked')).map(cb => cb.value)
        };

        try {
            const response = await window.timetableAPI.generateTimetable(config);
            if (response && response.success) {
                await this.displayTimetable(selectedSectionId);
                document.getElementById('saveTimetableBtn').style.display = 'inline-block';
                this.showMessage('Timetable generated successfully!', 'success');
            } else {
                this.showMessage(response?.message || 'Failed to generate timetable', 'error');
            }
        } catch (error) {
            console.error('Error generating timetable:', error);
            this.showMessage('Error generating timetable', 'error');
        }
    }

    async displayTimetable(sectionId) {
        try {
            const response = await window.timetableAPI.getTimetable(sectionId);
            if (response && response.success) {
                this.renderTimetableGrid(response.data);
            }
        } catch (error) {
            console.error('Error displaying timetable:', error);
        }
    }

    renderTimetableGrid(timetableData) {
        const container = document.getElementById('timetableContainer');
        if (!container) return;

        const workingDays = timetableData.working_days;
        const slots = timetableData.slots;

        let html = `
            <h3>Timetable for ${timetableData.name}</h3>
            <div class="timetable-grid">
                <div class="timetable-header">Time</div>
        `;

        // Add day headers
        workingDays.forEach(day => {
            html += `<div class="timetable-header">${day}</div>`;
        });

        // Get all unique time slots
        const timeSlots = new Set();
        Object.values(slots).forEach(daySlots => {
            daySlots.forEach(slot => {
                timeSlots.add(`${slot.start_time}-${slot.end_time}`);
            });
        });

        const sortedTimeSlots = Array.from(timeSlots).sort();

        // Add time slots and courses
        sortedTimeSlots.forEach(timeSlot => {
            html += `<div class="timetable-cell">${timeSlot}</div>`;
            
            workingDays.forEach(day => {
                const daySlots = slots[day] || [];
                const slot = daySlots.find(s => `${s.start_time}-${s.end_time}` === timeSlot);
                
                if (slot) {
                    if (slot.is_break) {
                        html += `<div class="timetable-cell break-cell">${slot.break_type === 'lunch' ? 'Lunch Break' : 'Break'}</div>`;
                    } else {
                        html += `
                            <div class="timetable-cell" style="background-color: ${slot.color}20; border-left: 4px solid ${slot.color}">
                                <strong>${slot.course_code}</strong><br>
                                <small>${slot.teacher}</small><br>
                                <small>${slot.room}</small>
                            </div>
                        `;
                    }
                } else {
                    html += `<div class="timetable-cell">-</div>`;
                }
            });
        });

        html += `</div>`;
        container.innerHTML = html;
    }

    saveTimetable() {
        this.showMessage('Timetable saved successfully!', 'success');
    }

    showMessage(message, type = 'info') {
        // Create or update message element
        let messageEl = document.getElementById('messageContainer');
        if (!messageEl) {
            messageEl = document.createElement('div');
            messageEl.id = 'messageContainer';
            messageEl.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 15px 20px;
                border-radius: 5px;
                color: white;
                font-weight: 500;
                z-index: 1000;
                max-width: 300px;
            `;
            document.body.appendChild(messageEl);
        }

        messageEl.textContent = message;
        messageEl.className = `message-${type}`;
        
        // Set background color based on type
        const colors = {
            success: '#2ecc71',
            error: '#e74c3c',
            info: '#3498db',
            warning: '#f39c12'
        };
        messageEl.style.backgroundColor = colors[type] || colors.info;
        messageEl.style.display = 'block';

        // Auto hide after 3 seconds
        setTimeout(() => {
            messageEl.style.display = 'none';
        }, 3000);
    }

    updateUI() {
        // Update step indicators and form visibility
        this.showStep(this.currentStep);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.timetableManager = new TimetableManager();
});