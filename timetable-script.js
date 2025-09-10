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
        timetableContainer: null,
        courseModal: null,
        closeModalBtn: null,
        cancelCourseBtn: null,
        saveCourseBtn: null,
        courseNameInput: null,
        courseCodeInput: null,
        teacherNameInput: null,
        roomNumberInput: null,
        courseDurationInput: null,
        sectionSelect: null,
        courseColorInput: null,
        colorValue: null,
        sectionManagement: null,
        sectionsContainer: null,
        addMoreSectionsBtn: null,
        saveSectionsBtn: null,
        closeSectionModalBtn: null,
        cancelSectionsBtn: null
    };

    // Initialize the application
    async function init() {
        try {
            initElements();
            setupEventListeners();
            await loadSections();
            if (state.sections.length > 0) {
                await selectSection(state.sections[0]._id);
            }
            setupSectionManagement();
        } catch (error) {
            console.error('Error initializing application:', error);
            showError('Failed to initialize application. Please refresh the page.');
        }
    }

    // Initialize DOM elements
    function initElements() {
        // Main app elements
        elements.generateBtn = document.getElementById('generateBtn');
        elements.openCourseModalBtn = document.getElementById('openCourseModal');
        elements.openSectionManagementBtn = document.getElementById('openSectionManagement');
        elements.saveTimetableBtn = document.getElementById('saveTimetableBtn');
        elements.resetBtn = document.getElementById('resetBtn');
        
        // Course modal elements
        elements.courseModal = document.getElementById('courseModal');
        elements.closeModalBtn = document.querySelector('.close-btn');
        elements.cancelCourseBtn = document.getElementById('cancelCourseBtn');
        elements.saveCourseBtn = document.getElementById('saveCourseBtn');
        elements.courseNameInput = document.getElementById('courseName');
        elements.courseCodeInput = document.getElementById('courseCode');
        elements.teacherNameInput = document.getElementById('teacherName');
        elements.roomNumberInput = document.getElementById('roomNumber');
        elements.courseDurationInput = document.getElementById('courseDuration');
        elements.sectionSelect = document.getElementById('sectionSelect');
        elements.courseColorInput = document.getElementById('courseColor');
        elements.colorValue = document.getElementById('colorValue');
        
        // Section management elements
        elements.sectionManagement = document.getElementById('sectionManagement');
        elements.sectionsContainer = document.getElementById('sectionsContainer');
        elements.addMoreSectionsBtn = document.getElementById('addMoreSections');
        elements.saveSectionsBtn = document.getElementById('saveSections');
        elements.closeSectionModalBtn = document.getElementById('closeSectionModal');
        elements.cancelSectionsBtn = document.getElementById('cancelSections');
        
        // Other elements
        elements.addSectionBtn = document.getElementById('addSectionBtn');
        elements.sectionNameInput = document.getElementById('sectionName');
        elements.sectionsList = document.getElementById('sectionsList');
    }

    // Set up event listeners
    function setupEventListeners() {
        // Reset button click handler
        const resetBtn = document.getElementById('resetTimetableBtn');
        if (resetBtn) {
            resetBtn.addEventListener('click', resetTimetable);
        }
        elements.generateBtn.addEventListener('click', generateTimetable);
        elements.openCourseModalBtn.addEventListener('click', () => showModal('courseModal'));
        elements.openSectionManagementBtn.addEventListener('click', () => showModal('sectionManagement'));
        elements.saveTimetableBtn.addEventListener('click', saveTimetable);
        elements.closeModalBtn.addEventListener('click', () => hideModal('courseModal'));
        elements.cancelCourseBtn.addEventListener('click', () => hideModal('courseModal'));
        elements.saveCourseBtn.addEventListener('click', addCourse);
        
        // Section management event listeners
        if (elements.addMoreSectionsBtn) {
            elements.addMoreSectionsBtn.addEventListener('click', addSectionEntry);
        }
        if (elements.saveSectionsBtn) {
            elements.saveSectionsBtn.addEventListener('click', saveAllSections);
        }
        if (elements.closeSectionModalBtn) {
            elements.closeSectionModalBtn.addEventListener('click', () => hideModal('sectionManagement'));
        }
        if (elements.cancelSectionsBtn) {
            elements.cancelSectionsBtn.addEventListener('click', () => hideModal('sectionManagement'));
        }
        
        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target === elements.courseModal) {
                hideModal('courseModal');
            } else if (e.target === elements.sectionManagement) {
                hideModal('sectionManagement');
            }
        });
    }

    // Show modal function
    function showModal(modalId) {
        if (elements[modalId]) {
            elements[modalId].style.display = 'block';
            document.body.style.overflow = 'hidden';
        }
    }

    // Hide modal function
    function hideModal(modalId) {
        if (elements[modalId]) {
            elements[modalId].style.display = 'none';
            document.body.style.overflow = '';
        }
    }

    // Show success message
    function showSuccess(message) {
        alert('Success: ' + message);
    }
    
    // Show error message
    function showError(message) {
        alert('Error: ' + message);
    }

    // Select a section
    async function selectSection(sectionId) {
        try {
            state.currentSection = sectionId;
            // Update UI to show selected section
            const sectionElements = document.querySelectorAll('.section-tag');
            sectionElements.forEach(el => {
                if (el.dataset.sectionId === sectionId) {
                    el.classList.add('active');
                    el.querySelector('input[type="radio"]').checked = true;
                } else {
                    el.classList.remove('active');
                    el.querySelector('input[type="radio"]').checked = false;
                }
            });
            
            // Load courses for this section
            await loadCourses(sectionId);
        } catch (error) {
            console.error('Error selecting section:', error);
            showError('Failed to select section');
        }
    }
    
    // Remove a section
    async function removeSection(sectionId) {
        try {
            if (!confirm('Are you sure you want to delete this section? This action cannot be undone.')) {
                return;
            }
            
            // Remove from server
            await api.delete(`/api/sections/${sectionId}`);
            
            // Remove from state
            state.sections = state.sections.filter(s => s._id !== sectionId);
            
            // Update UI
            const sectionElement = document.querySelector(`.section-tag[data-section-id="${sectionId}"]`);
            if (sectionElement) {
                sectionElement.remove();
            }
            
            // If we removed the current section, select the first available one
            if (state.currentSection === sectionId) {
                if (state.sections.length > 0) {
                    await selectSection(state.sections[0]._id);
                } else {
                    state.currentSection = null;
                    // Clear courses display
                    if (elements.timetableContainer) {
                        elements.timetableContainer.innerHTML = '';
                    }
                }
            }
            
            showSuccess('Section removed successfully');
        } catch (error) {
            console.error('Error removing section:', error);
            showError('Failed to remove section');
        }
    }
    
    // Load courses for a section
    async function loadCourses(sectionId) {
        if (!sectionId || !elements.timetableContainer) return;
        
        try {
            // Clear existing timetable
            elements.timetableContainer.innerHTML = 'Loading courses...';
            
            // Fetch courses for this section
            // const courses = await api.get(`/api/sections/${sectionId}/courses`);
            const courses = []; // Placeholder - replace with actual API call
            
            // Update UI with courses
            if (courses.length === 0) {
                elements.timetableContainer.innerHTML = '<p>No courses found for this section.</p>';
            } else {
                // Here you would render the courses in the timetable
                elements.timetableContainer.innerHTML = '<p>Timetable will be displayed here.</p>';
            }
        } catch (error) {
            console.error('Error loading courses:', error);
            showError('Failed to load courses');
            elements.timetableContainer.innerHTML = '<p>Error loading courses. Please try again.</p>';
        }
    }
    
    // Load sections from the server
    async function loadSections() {
        try {
            // This would be replaced with actual API call
            // state.sections = await sectionApi.getAll();
            console.log('Loading sections...');
            
            // Update UI
            updateSectionsList();
            populateSectionsInDropdown();
        } catch (error) {
            console.error('Error loading sections:', error);
            showError('Failed to load sections');
            return [];
        }
    }
    
    // Update sections list in the UI
    function updateSectionsList() {
        if (!elements.sectionsList) return;
        
        elements.sectionsList.innerHTML = '';
        state.sections.forEach(section => {
            addSectionToUI(section);
            selectSection(section._id);
        });
    }
    
    const removeBtn = sectionElement.querySelector('.remove-section');
    if (removeBtn) {
        removeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (confirm(`Are you sure you want to remove section ${section.name}?`)) {
                removeSection(section._id);
            }
        });
        
        elements.sectionsList.appendChild(sectionElement);
    }

        // Add section management
    function setupSectionManagement() {
        if (!elements.addSectionBtn || !elements.sectionNameInput) return;
        
        elements.addSectionBtn.addEventListener('click', async function() {
            const sectionName = elements.sectionNameInput.value.trim();
            if (!sectionName) return;
            
            try {
                // Create section with default values
                const sectionData = {
                    name: sectionName,
                    startTime: '09:00 AM',
                    endTime: '04:00 PM',
                    periodDuration: 50,
                    breakDuration: 10,
                    lunchStart: '12:30 PM',
                    lunchDuration: 45,
                    workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
                    _id: 'section-' + Date.now() // Temporary ID for demo
                };
                
                // This would be replaced with actual API call
                // const section = await sectionApi.create(sectionData);
                state.sections.push(sectionData);
                addSectionToUI(sectionData);
                elements.sectionNameInput.value = '';
                
                // Select the new section
                await selectSection(sectionData._id);
            } catch (error) {
                console.error('Error creating section:', error);
                showError('Failed to create section');
            }
        });
    }

    // Populate sections in dropdown
    function populateSectionsInDropdown() {
        if (!elements.sectionSelect) return;
        
        // Clear existing options except the first one
        elements.sectionSelect.innerHTML = '<option value="">Select a section</option>';
        
        state.sections.forEach(section => {
            const option = document.createElement('option');
            option.value = section._id;
            option.textContent = section.name;
            elements.sectionSelect.appendChild(option);
        });
    }

    // Function to add a new course
    async function addCourse() {
        try {
            const courseData = {
                name: courseNameInput.value.trim(),
                code: courseCodeInput.value.trim().toUpperCase(),
                teacher: teacherNameInput.value.trim(),
                room: roomNumberInput.value.trim(),
                duration: parseInt(courseDurationInput.value),
                sectionId: sectionSelect.value,
                color: courseColorInput.value
            };

            // Validate inputs
            if (!courseData.name || !courseData.code || !courseData.teacher || !courseData.room || !courseData.sectionId) {
                showError('Please fill in all required fields');
                return;
            }

            // Call the API to add the course
            const response = await fetch('/api/courses', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(courseData)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to add course');
            }

            const newCourse = await response.json();
            
            // Reset the form
            courseNameInput.value = '';
            courseCodeInput.value = '';
            teacherNameInput.value = '';
            roomNumberInput.value = '';
            courseDurationInput.value = '1';
            courseColorInput.value = '#3f51b5';

            showSuccess('Course added successfully!');
            
            // Refresh the courses list if needed
            if (currentSection) {
                await loadCoursesForSection(currentSection);
            }
        } catch (error) {
            console.error('Error adding course:', error);
    }

    const timetable = timetables[currentSection];
    const section = sections.find(s => s.id === currentSection);

    let html = `
        <div class="timetable-header-section">
            <h2>${section.name} - Timetable</h2>
        </div>
        <div class="timetable-grid">
    `;

    // Add header row with days
    html += '<div class="timetable-header">Time</div>';
    timetable.workingDays.forEach(day => {
        html += `<div class="timetable-header">${day}</div>`;
    });

    // Add time slots
    timetable.timeSlots.forEach(slot => {
        if (slot.type === 'period') {
            html += `<div class="timetable-header">${slot.start} - ${slot.end}<br>Period ${slot.period}</div>`;

            // Add cells for each day
            timetable.workingDays.forEach(day => {
                const assignedCourse = section.assignedCourses?.find(c => 
                    c.period === slot.period && c.days.includes(day)
                );

                const isConflict = assignedCourse && state.conflicts.has(assignedCourse.courseId);
                const conflictClass = isConflict ? ' conflict' : '';

                if (assignedCourse) {
                    html += `
                        <div class="timetable-cell${conflictClass}" 
                             data-period="${slot.period}" 
                             data-day="${day}"
                             data-course-id="${assignedCourse.courseId}">
                            <strong>${assignedCourse.name}</strong><br>
                            ${assignedCourse.teacher}<br>
                            ${assignedCourse.room}
                        </div>
                    `;
                } else {
                    html += `
                        <div class="timetable-cell" 
                             data-period="${slot.period}" 
                             data-day="${day}"></div>
                    `;
                }
            });
        } else if (slot.type === 'lunch') {
            html += `<div class="timetable-header break-cell">${slot.start} - ${slot.end}<br>Lunch</div>`;
            html += `<div class="timetable-cell break-cell" colspan="${timetable.workingDays.length}">Lunch Break</div>`;
        }
    });

    html += '</div>';

    // Add conflicts section if any
    if (state.conflicts.size > 0) {
        const conflictCourses = state.courses.filter(c => state.conflicts.has(c.id));
        html += `
            <div class="conflicts-section" style="margin-top: 2rem; padding: 1rem; background: #ffebee; border-radius: 4px;">
                <h3>⚠️ Conflicts - Could not schedule the following courses:</h3>
                <ul>
                    ${conflictCourses.map(c => `<li>${c.name} (${c.teacher}) - ${c.days.join(', ')}</li>`).join('')}
                </ul>
            </div>
        `;
    }

    if (elements.timetableContainer) {
        elements.timetableContainer.innerHTML = html;
    }
}

        // Remove a section
    async function removeSection(sectionId) {
        if (!confirm('Are you sure you want to remove this section? This cannot be undone.')) {
            return;
        }
        
        try {
            // This would be replaced with actual API call
            // await sectionApi.delete(sectionId);
            state.sections = state.sections.filter(s => s._id !== sectionId);
            
            // Update UI
            updateSectionsList();
            populateSectionsInDropdown();
            
            // If current section was removed, select first available section or clear
            if (state.currentSection === sectionId) {
                state.currentSection = state.sections.length > 0 ? state.sections[0]._id : null;
                if (state.currentSection) {
                    await selectSection(state.currentSection);
                } else {
                    // No sections left
                    if (elements.timetableContainer) {
                        elements.timetableContainer.innerHTML = '';
                    }
                }
            }
        } catch (error) {
            console.error('Error removing section:', error);
            showError('Failed to remove section');
        }
    }

    // Reset the entire timetable
    function resetTimetable() {
        if (confirm('Are you sure you want to reset the timetable? This will clear all courses and sections.')) {
            // Clear the timetable display
            elements.timetableContainer.innerHTML = '';
            
            // Reset the state
            state.courses = [];
            state.timetables = {};
            state.conflicts.clear();
            
            // Reset the UI
            updateCoursesList();
            showSuccess('Timetable has been reset successfully!');
        }
    }

    // Public API
    return {
        init: init,
        showModal: showModal,
        resetTimetable: resetTimetable,
        hideModal: hideModal,
        showError: showError,
        showSuccess: showSuccess
    };

})();

// API helper functions
const api = {
    async get(url) {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Network response was not ok');
        return response.json();
    },
    
    async post(url, data) {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Network response was not ok');
        return response.json();
    },
    
    async delete(url) {
        const response = await fetch(url, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Failed to delete resource');
        return response.json();
    }
};

// Global function to reset the form
function resetForm() {
    // Clear form inputs
    document.getElementById('collegeStartTime').value = '09:00 AM';
    document.getElementById('collegeEndTime').value = '04:00 PM';
    document.getElementById('periodDuration').value = '50';
    document.getElementById('breakDuration').value = '10';
    document.getElementById('lunchStartTime').value = '12:30';
    document.getElementById('lunchDuration').value = '45';
    
    // Reset working days checkboxes
    const workingDayCheckboxes = document.querySelectorAll('input[name="workingDays"]');
    workingDayCheckboxes.forEach(checkbox => {
        if (['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].includes(checkbox.value)) {
            checkbox.checked = true;
        } else {
            checkbox.checked = false;
        }
    });
    
}

// Update courses list in the UI
function updateCoursesList() {
    if (elements && elements.sectionsList) {
        // Update the courses list in the UI
        // This is a placeholder - implement the actual logic here
        console.log('Updating courses list...');
    }
}

// Clear course modal inputs
if (elements.courseModal) {
    elements.courseNameInput.value = '';
    elements.courseCodeInput.value = '';
    elements.teacherNameInput.value = '';
    elements.roomNumberInput.value = '';
    elements.courseDurationInput.value = '1';
    elements.courseColorInput.value = '#3f51b5';
    elements.colorValue.textContent = '#3f51b5';
}

// Initialize the application when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    TimetableApp.init();
});
