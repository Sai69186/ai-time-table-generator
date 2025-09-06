// Timetable Generator Application
const TimetableApp = (function() {
    'use strict';
    
    // Application state
    const state = {
        sections: [],
        courses: [],
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
        timetableContainer: null
    };

    // Initialize the application
    function init() {
        initElements();
        setupEventListeners();
        loadSections();
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
        
        // Close modals when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                e.target.style.display = 'none';
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
    function selectSection(sectionId) {
        state.currentSection = sectionId;
        loadCourses(sectionId);
    }

    // Load courses for a section
    async function loadCourses(sectionId) {
        try {
            const courses = await this.get(`/api/sections/${sectionId}/courses`);
            state.courses = courses;
            updateCoursesList();
        } catch (error) {
            showError('Failed to load courses');
            console.error(error);
        }
    }

    // Load sections from the server
    async function loadSections() {
        try {
            state.sections = await this.get('/api/sections');
            updateSectionsList();
        } catch (error) {
            showError('Failed to load sections');
            console.error(error);
        }
    }

    // Update sections list in the UI
    function updateSectionsList() {
        if (!elements.sectionsList) return;
        
        elements.sectionsList.innerHTML = '';
        
        state.sections.forEach(section => {
            const li = document.createElement('li');
            li.textContent = section.name;
            li.addEventListener('click', () => selectSection(section.id));
            
            const removeBtn = document.createElement('button');
            removeBtn.textContent = '×';
            removeBtn.className = 'remove-section';
            removeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                removeSection(section.id);
            });
            
            li.appendChild(removeBtn);
            elements.sectionsList.appendChild(li);
        });
    }

    // Add a new section
    async function addSection() {
        const sectionName = elements.sectionNameInput?.value.trim();
        if (!sectionName) return;
        
        try {
            const newSection = await this.post('/api/sections', { name: sectionName });
            state.sections.push(newSection);
            updateSectionsList();
            elements.sectionNameInput.value = '';
            showSuccess('Section added successfully');
        } catch (error) {
            showError('Failed to add section');
            console.error(error);
        }
    }

    // Remove a section
    async function removeSection(sectionId) {
        if (!confirm('Are you sure you want to remove this section?')) return;
        
        try {
            await this.delete(`/api/sections/${sectionId}`);
            state.sections = state.sections.filter(s => s.id !== sectionId);
            updateSectionsList();
            showSuccess('Section removed successfully');
        } catch (error) {
            showError('Failed to remove section');
            console.error(error);
        }
    }

    // Add a new course
    async function addCourse() {
        if (!state.currentSection) {
            showError('Please select a section first');
            return;
        }
        
        const courseData = {
            name: elements.courseNameInput?.value.trim(),
            code: elements.courseCodeInput?.value.trim(),
            teacher: elements.teacherNameInput?.value.trim(),
            room: elements.roomNumberInput?.value.trim(),
            duration: parseInt(elements.courseDurationInput?.value) || 1,
            color: elements.courseColorInput?.value || '#3f51b5',
            sectionId: state.currentSection
        };
        
        // Basic validation
        if (!courseData.name || !courseData.code) {
            showError('Please fill in all required fields');
            return;
        }
        
        try {
            const newCourse = await this.post('/api/courses', courseData);
            state.courses.push(newCourse);
            updateCoursesList();
            hideModal('courseModal');
            elements.courseForm.reset();
            showSuccess('Course added successfully');
        } catch (error) {
            showError('Failed to add course');
            console.error(error);
        }
    }

    // Remove a course
    async function removeCourse(courseId) {
        try {
            await this.delete(`/api/courses/${courseId}`);
            state.courses = state.courses.filter(c => c.id !== courseId);
            updateCoursesList();
            showSuccess('Course removed successfully');
        } catch (error) {
            showError('Failed to remove course');
            console.error(error);
        }
    }

    // Update courses list in the UI
    function updateCoursesList() {
        if (!elements.timetableContainer) return;
        
        // Clear existing content
        elements.timetableContainer.innerHTML = '';
        
        // Group courses by day
        const coursesByDay = {};
        state.courses.forEach(course => {
            if (!coursesByDay[course.day]) {
                coursesByDay[course.day] = [];
            }
            coursesByDay[course.day].push(course);
        });
        
        // Create timetable UI (simplified for brevity)
        const timetable = document.createElement('div');
        timetable.className = 'timetable';
        
        // Add header row
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
        const headerRow = document.createElement('div');
        headerRow.className = 'timetable-row header';
        
        // Add time column header
        const timeHeader = document.createElement('div');
        timeHeader.className = 'timetable-cell time-header';
        timeHeader.textContent = 'Time';
        headerRow.appendChild(timeHeader);
        
        // Add day headers
        days.forEach(day => {
            const dayHeader = document.createElement('div');
            dayHeader.className = 'timetable-cell day-header';
            dayHeader.textContent = day;
            headerRow.appendChild(dayHeader);
        });
        
        timetable.appendChild(headerRow);
        
        // Add time slots (simplified)
        for (let hour = 9; hour <= 17; hour++) {
            const timeRow = document.createElement('div');
            timeRow.className = 'timetable-row';
            
            // Add time cell
            const timeCell = document.createElement('div');
            timeCell.className = 'timetable-cell time-cell';
            timeCell.textContent = `${hour}:00`;
            timeRow.appendChild(timeCell);
            
            // Add day cells
            days.forEach(day => {
                const dayCell = document.createElement('div');
                dayCell.className = 'timetable-cell';
                
                // Check for courses at this time
                const courses = coursesByDay[day] || [];
                courses.forEach(course => {
                    // Simplified: just show course code if it matches the hour
                    if (course.startHour === hour) {
                        const courseElement = document.createElement('div');
                        courseElement.className = 'course';
                        courseElement.style.backgroundColor = course.color;
                        courseElement.textContent = course.code;
                        dayCell.appendChild(courseElement);
                    }
                });
                
                timeRow.appendChild(dayCell);
            });
            
            timetable.appendChild(timeRow);
        }
        
        elements.timetableContainer.appendChild(timetable);
    }

    // Reset the form
    function resetForm() {
        if (confirm('Are you sure you want to reset the form? This will clear all your input.')) {
            // Reset form elements
            const form = document.getElementById('timetable-form');
            if (form) form.reset();
            
            // Reset the state
            state.courses = [];
            state.currentSection = null;
            
            // Clear the timetable display
            if (elements.timetableContainer) {
                elements.timetableContainer.innerHTML = '';
            }
            
            // Show success message
            showSuccess('Form has been reset successfully');
        }
    }

    // API methods
    async function get(url) {
        try {
            const response = await fetch(url);
            return await response.json();
        } catch (error) {
            console.error('GET request failed:', error);
            throw error;
        }
    }
    
    async function post(url, data) {
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
            return await response.json();
        } catch (error) {
            console.error('POST request failed:', error);
            throw error;
        }
    }
    
    async function deleteMethod(url) {
        try {
            const response = await fetch(url, {
                method: 'DELETE'
            });
            return await response.json();
        } catch (error) {
            console.error('DELETE request failed:', error);
            throw error;
        }
    }

    // Public API
    return {
        init: init,
        showModal: showModal,
        hideModal: hideModal,
        showSuccess: showSuccess,
        showError: showError,
        selectSection: selectSection,
        removeSection: removeSection,
        addCourse: addCourse,
        removeCourse: removeCourse,
        loadSections: loadSections,
        updateCoursesList: updateCoursesList,
        resetForm: resetForm,
        get: get,
        post: post,
        delete: deleteMethod
    };
})();

// Initialize the application when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    TimetableApp.init();
});
