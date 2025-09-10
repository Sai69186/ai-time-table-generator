// Timetable Generator Application
const TimetableApp = (function() {
    'use strict';
    
    // API configuration
    const API_BASE_URL = 'http://localhost:3000';
    
    // Application state
    const state = {
        sections: [],
        courses: [],
        teachers: [],
        rooms: [],
        subjects: [],
        currentSection: null,
        timetables: {},
        conflicts: new Set()
    };

    // DOM Elements
    const elements = {
        generateBtn: null,
        openCourseModalBtn: null,
        saveTimetableBtn: null,
        resetBtn: null,
        addSectionBtn: null,
        sectionNameInput: null,
        sectionsList: null,
        courseModal: null,
        courseNameInput: null,
        courseCodeInput: null,
        teacherNameInput: null,
        roomNumberInput: null,
        courseDurationInput: null,
        courseColorInput: null,
        colorValue: null,
        courseForm: null,
        timetableContainer: null,
        coursesList: null
    };

    // Initialize the application
    function init() {
        initElements();
        setupEventListeners();
        loadInitialData();
    }

    // Load initial data
    async function loadInitialData() {
        try {
            await Promise.all([
                loadSections(),
                loadTeachers(),
                loadRooms(),
                loadSubjects()
            ]);
            
            // If there are sections, load the first one
            if (state.sections.length > 0) {
                selectSection(state.sections[0].id);
            }
        } catch (error) {
            console.error('Error loading initial data:', error);
            showError('Failed to load initial data. Please refresh the page.');
        }
    }

    // Load teachers from the server
    async function loadTeachers() {
        try {
            const response = await api.get('/api/university/teachers');
            if (response.success) {
                state.teachers = response.data || [];
                updateTeacherDropdowns();
            }
        } catch (error) {
            console.error('Error loading teachers:', error);
            throw error;
        }
    }

    // Load rooms from the server
    async function loadRooms() {
        try {
            const response = await api.get('/api/university/rooms');
            if (response.success) {
                state.rooms = response.data || [];
                updateRoomDropdowns();
            }
        } catch (error) {
            console.error('Error loading rooms:', error);
            throw error;
        }
    }

    // Load subjects from the server
    async function loadSubjects() {
        try {
            const response = await api.get('/api/university/subjects');
            if (response.success) {
                state.subjects = response.data || [];
                updateSubjectDropdowns();
            }
        } catch (error) {
            console.error('Error loading subjects:', error);
            throw error;
        }
    }

    // Load sections from the server
    async function loadSections() {
        try {
            const response = await api.get('/api/university/sections');
            if (response && response.success) {
                state.sections = response.data || [];
                updateSectionsList();
                return state.sections;
            } else {
                throw new Error(response?.message || 'Failed to load sections');
            }
        } catch (error) {
            console.error('Error loading sections:', error);
            showError('Failed to load sections. Please check your connection and try again.');
            throw error;
        }
    }

    // Update teacher dropdowns in the UI
    function updateTeacherDropdowns() {
        const teacherSelects = document.querySelectorAll('select.teacher-select');
        teacherSelects.forEach(select => {
            const currentValue = select.value;
            select.innerHTML = '<option value="">Select Teacher</option>';
            state.teachers.forEach(teacher => {
                const option = document.createElement('option');
                option.value = teacher.id;
                option.textContent = teacher.name;
                select.appendChild(option);
            });
            select.value = currentValue;
        });
    }

    // Update room dropdowns in the UI
    function updateRoomDropdowns() {
        const roomSelects = document.querySelectorAll('select.room-select');
        roomSelects.forEach(select => {
            const currentValue = select.value;
            select.innerHTML = '<option value="">Select Room</option>';
            state.rooms.forEach(room => {
                const option = document.createElement('option');
                option.value = room.id;
                option.textContent = `${room.building} - ${room.number} (${room.capacity})`;
                select.appendChild(option);
            });
            select.value = currentValue;
        });
    }

    // Update subject dropdowns in the UI
    function updateSubjectDropdowns() {
        const subjectSelects = document.querySelectorAll('select.subject-select');
        subjectSelects.forEach(select => {
            const currentValue = select.value;
            select.innerHTML = '<option value="">Select Subject</option>';
            state.subjects.forEach(subject => {
                const option = document.createElement('option');
                option.value = subject.id;
                option.textContent = `${subject.code} - ${subject.name}`;
                select.appendChild(option);
            });
            select.value = currentValue;
        });
    }

    // Update sections list in the UI
    function updateSectionsList() {
        const sectionsList = document.getElementById('sectionsList');
        if (!sectionsList) return;

        sectionsList.innerHTML = ''; // Clear existing list

        if (state.sections.length === 0) {
            sectionsList.innerHTML = '<div class="no-sections">No sections found. Add a section to get started.</div>';
            return;
        }

        state.sections.forEach(section => {
            const sectionElement = document.createElement('div');
            sectionElement.className = 'section-item';
            sectionElement.innerHTML = `
                <span class="section-name">${section.name || 'Unnamed Section'}</span>
                <button class="btn btn-sm btn-outline-danger delete-section" data-id="${section.id}">
                    <i class="fas fa-trash"></i>
                </button>
            `;
            
            // Add click handler to select section
            sectionElement.querySelector('.section-name').addEventListener('click', () => {
                selectSection(section.id);
            });

            // Add delete handler
            const deleteBtn = sectionElement.querySelector('.delete-section');
            deleteBtn.addEventListener('click', async (e) => {
                e.stopPropagation();
                if (confirm(`Are you sure you want to delete ${section.name}?`)) {
                    try {
                        await api.delete(`/api/university/sections/${section.id}`);
                        state.sections = state.sections.filter(s => s.id !== section.id);
                        updateSectionsList();
                        showSuccess('Section deleted successfully');
                    } catch (error) {
                        console.error('Error deleting section:', error);
                        showError('Failed to delete section');
                    }
                }
            });

            sectionsList.appendChild(sectionElement);
        });
    }

    // Update courses list in the UI
    function updateCoursesList() {
        const coursesList = document.getElementById('coursesList');
        if (!coursesList) return;

        coursesList.innerHTML = ''; // Clear existing list

        if (state.courses.length === 0) {
            coursesList.innerHTML = '<div class="no-courses">No courses found. Add a course to get started.</div>';
            return;
        }

        state.courses.forEach(course => {
            const courseElement = document.createElement('div');
            courseElement.className = 'course-item';
            courseElement.innerHTML = `
                <div class="course-info">
                    <span class="course-name">${course.subject_name || 'Unnamed Course'}</span>
                    <span class="course-teacher">${course.teacher_name || 'No teacher'}</span>
                    <span class="course-room">${course.room_number ? `Room: ${course.room_number}` : ''}</span>
                </div>
                <button class="btn btn-sm btn-outline-danger delete-course" data-id="${course.id}">
                    <i class="fas fa-trash"></i>
                </button>
            `;
            
            // Add delete handler
            const deleteBtn = courseElement.querySelector('.delete-course');
            deleteBtn.addEventListener('click', async (e) => {
                e.stopPropagation();
                if (confirm(`Are you sure you want to delete ${course.subject_name}?`)) {
                    try {
                        await api.delete(`/api/university/courses/${course.id}`);
                        state.courses = state.courses.filter(c => c.id !== course.id);
                        updateCoursesList();
                        showSuccess('Course deleted successfully');
                    } catch (error) {
                        console.error('Error deleting course:', error);
                        showError('Failed to delete course');
                    }
                }
            });

            coursesList.appendChild(courseElement);
        });
    }

    // Load courses for a section
    async function loadCourses(sectionId) {
        try {
            const response = await api.get(`/api/university/courses?section_id=${sectionId}`);
            if (response.success) {
                state.courses = response.data || [];
                updateCoursesList();
            }
        } catch (error) {
            console.error('Error loading courses:', error);
            throw error;
        }
    }

    // Load timetable for a section
    async function loadTimetable(sectionId) {
        try {
            const response = await api.get(`/api/university/timetables?section_id=${sectionId}`);
            if (response.success && response.data && response.data.length > 0) {
                // Assuming the API returns an array and we want the first timetable
                const timetable = response.data[0];
                state.timetables[sectionId] = timetable;
                renderTimetable(timetable);
                return timetable;
            }
            // If no timetable exists yet, return null
            return null;
        } catch (error) {
            console.error('Error loading timetable:', error);
            // Don't show error if no timetable exists (404)
            if (error.status !== 404) {
                showError('Failed to load timetable');
            }
            return null;
        }
    }

    // API service
    const api = {
        async get(url) {
            try {
                const response = await fetch(`${API_BASE_URL}${url}`, {
                    method: 'GET',
                    headers: getHeaders()
                });
                return await response.json();
            } catch (error) {
                console.error(`GET ${url} failed:`, error);
                throw error;
            }
        },

        async post(url, data) {
            try {
                const response = await fetch(`${API_BASE_URL}${url}`, {
                    method: 'POST',
                    headers: getHeaders(),
                    body: JSON.stringify(data)
                });
                return await response.json();
            } catch (error) {
                console.error(`POST ${url} failed:`, error);
                throw error;
            }
        },

        async delete(url) {
            try {
                const response = await fetch(`${API_BASE_URL}${url}`, {
                    method: 'DELETE',
                    headers: getHeaders()
                });
                return await response.json();
            } catch (error) {
                console.error(`DELETE ${url} failed:`, error);
                throw error;
            }
        }
    };

    // Get headers with auth token
    function getHeaders() {
        const token = localStorage.getItem('token');
        const headers = {
            'Content-Type': 'application/json'
        };
        
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        
        return headers;
    }

    // Initialize DOM elements
    function initElements() {
        // Main elements
        elements.generateBtn = document.getElementById('generateTimetable');
        elements.openCourseModalBtn = document.getElementById('openCourseModal');
        elements.saveTimetableBtn = document.getElementById('saveTimetable');
        elements.resetBtn = document.getElementById('resetForm');
        elements.addSectionBtn = document.getElementById('addSection');
        elements.sectionNameInput = document.getElementById('sectionName');
        elements.sectionsList = document.getElementById('sectionsList');
        elements.coursesList = document.getElementById('coursesList');
        
        // Course modal elements
        elements.courseModal = document.getElementById('courseModal');
        elements.courseNameInput = document.getElementById('courseName');
        elements.courseCodeInput = document.getElementById('courseCode');
        elements.teacherNameInput = document.getElementById('teacherName');
        elements.roomNumberInput = document.getElementById('roomNumber');
        elements.courseDurationInput = document.getElementById('courseDuration');
        elements.courseColorInput = document.getElementById('courseColor');
        elements.colorValue = document.getElementById('colorValue');
        elements.courseForm = document.getElementById('courseForm');
        
        // Timetable elements
        elements.timetableContainer = document.getElementById('timetableContainer');
    }

    // Set up event listeners
    function setupEventListeners() {
        // Section management
        if (elements.addSectionBtn) {
            elements.addSectionBtn.addEventListener('click', addSection);
        }
        
        if (elements.resetBtn) {
            elements.resetBtn.addEventListener('click', resetForm);
        }
        
        // Course management
        if (elements.openCourseModalBtn) {
            elements.openCourseModalBtn.addEventListener('click', () => showModal('courseModal'));
        }
        
        if (elements.courseForm) {
            elements.courseForm.addEventListener('submit', (e) => {
                e.preventDefault();
                addCourse();
            });
        }
        
        // Color picker
        if (elements.courseColorInput) {
            elements.courseColorInput.addEventListener('input', (e) => {
                if (elements.colorValue) {
                    elements.colorValue.textContent = e.target.value;
                }
            });
        }
        
        // Generate timetable
        if (elements.generateBtn) {
            elements.generateBtn.addEventListener('click', generateTimetable);
        }
        
        // Close modals when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                hideModal(e.target.id);
            }
        });
    }

    // Show modal
    function showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'block';
        }
    }

    // Hide modal
    function hideModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
        }
    }

    // Show success message
    function showSuccess(message) {
        alert(`Success: ${message}`);
    }

    // Show error message
    function showError(message) {
        alert(`Error: ${message}`);
    }

    // Select a section
    async function selectSection(sectionId) {
        try {
            state.currentSection = sectionId;
            await loadCourses(sectionId);
            await loadTimetable(sectionId);
            updateUI();
        } catch (error) {
            console.error('Error selecting section:', error);
            showError('Failed to load section data');
        }
    }

    // Generate timetable
    async function generateTimetable() {
        if (!state.currentSection) {
            showError('Please select a section first');
            return;
        }

        try {
            const response = await api.post('/api/university/timetables/generate', {
                section_id: state.currentSection
            });

            if (response.success) {
                state.timetables[state.currentSection] = response.data;
                renderTimetable(response.data);
                
                if (response.data.conflicts?.total > 0) {
                    showConflicts(response.data.conflicts.list);
                } else {
                    showSuccess('Timetable generated successfully!');
                }
            } else {
                showError(response.message || 'Failed to generate timetable');
            }
        } catch (error) {
            console.error('Error generating timetable:', error);
            showError('Failed to generate timetable');
        }
    }

    // Show conflicts in a modal
    function showConflicts(conflicts) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.id = 'conflictsModal';
        
        let conflictsHTML = conflicts.map(conflict => `
            <div class="conflict">
                <strong>${conflict.type.toUpperCase()} CONFLICT:</strong> ${conflict.message}
                <div class="conflict-details">
                    ${JSON.stringify(conflict.details, null, 2)}
                </div>
            </div>
        `).join('');
        
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close-btn">&times;</span>
                <h3>Generated with ${conflicts.length} Conflicts</h3>
                <div class="conflicts-list">
                    ${conflictsHTML}
                </div>
                <div class="modal-actions">
                    <button class="btn btn-primary" id="acceptConflicts">Accept and Continue</button>
                    <button class="btn btn-secondary" id="regenerateTimetable">Regenerate</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Close modal
        modal.querySelector('.close-btn').addEventListener('click', () => {
            modal.remove();
        });
        
        // Accept conflicts
        modal.querySelector('#acceptConflicts').addEventListener('click', () => {
            modal.remove();
            showSuccess('Timetable saved with conflicts');
        });
        
        // Regenerate timetable
        modal.querySelector('#regenerateTimetable').addEventListener('click', () => {
            modal.remove();
            generateTimetable();
        });
        
        // Close when clicking outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    // Render timetable
    function renderTimetable(timetable) {
        if (!timetable || !timetable.slots) {
            elements.timetableContainer.innerHTML = '<p>No timetable data available. Generate a timetable first.</p>';
            return;
        }

        const days = timetable.days || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
        const timeSlots = timetable.time_slots || [
            '09:00-10:00', '10:00-11:00', '11:00-12:00',
            '12:00-13:00', '14:00-15:00', '15:00-16:00', '16:00-17:00'
        ];

        // Group slots by day and time
        const slotsByDay = {};
        days.forEach(day => {
            slotsByDay[day] = {};
            timeSlots.forEach(slot => {
                slotsByDay[day][slot] = [];
            });
        });

        // Populate slots
        timetable.slots.forEach(slot => {
            const timeSlot = `${slot.start_time}-${slot.end_time}`;
            if (slotsByDay[slot.day] && slotsByDay[slot.day][timeSlot]) {
                slotsByDay[slot.day][timeSlot].push(slot);
            }
        });

        // Generate HTML
        let html = `
            <div class="timetable">
                <div class="timetable-header">
                    <div class="timetable-cell">Time</div>
                    ${days.map(day => `<div class="timetable-cell">${day}</div>`).join('')}
                </div>
        `;

        timeSlots.forEach(timeSlot => {
            const [startTime, endTime] = timeSlot.split('-');
            html += `
                <div class="timetable-row">
                    <div class="timetable-time">${startTime} - ${endTime}</div>
            `;

            days.forEach(day => {
                const slot = slotsByDay[day]?.[timeSlot]?.[0];
                if (slot) {
                    html += `
                        <div class="timetable-slot" style="background-color: ${slot.color || '#e3f2fd'}">
                            <div class="course-name">${slot.subject_name || 'N/A'}</div>
                            <div class="course-teacher">${slot.teacher_name || 'N/A'}</div>
                            <div class="course-room">${slot.room_number || 'N/A'}</div>
                        </div>
                    `;
                } else {
                    html += '<div class="timetable-slot empty"></div>';
                }
            });

            html += '</div>';
        });

        html += '</div>';
        elements.timetableContainer.innerHTML = html;
    }

    // Update the UI
    function updateUI() {
        updateSectionsList();
        updateCoursesList();
    }

    // Export the public API
    return {
        init: init,
        showModal: showModal,
        hideModal: hideModal,
        showSuccess: showSuccess,
        showError: showError,
        selectSection: selectSection,
        generateTimetable: generateTimetable
    };
})();

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    TimetableApp.init();
});
