// Timetable Generator Application
const TimetableApp = (function() {
    // Application state
    const state = {
        sections: [],
        courses: [],
        teachers: [],
        currentSection: null,
        timetables: {},
        conflicts: new Set()
    };
    
    // Helper function to generate unique IDs
    function generateId(prefix = '') {
        return `${prefix}${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

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
        colorValue: null
    };

    // Initialize the application
    async function init() {
        try {
            initElements();
            setupEventListeners();
            
            // Load initial data
            await Promise.all([
                loadSections(),
                loadCourses(),
                loadTeachers()
            ]);
            
            // Initialize UI
            if (state.sections.length > 0) {
                await selectSection(state.sections[0]._id);
                if (elements.sectionSelect) {
                    elements.sectionSelect.value = state.sections[0]._id;
                }
            }
            
            // Set default time values
            if (elements.startTimeInput) elements.startTimeInput.value = '09:00';
            if (elements.endTimeInput) elements.endTimeInput.value = '10:00';
            
        } catch (error) {
            console.error('Error initializing application:', error);
            showError('Failed to initialize application. Please refresh the page.');
        }
    }

    // Initialize DOM elements
    function initElements() {
        elements.generateBtn = document.getElementById('generateBtn');
        elements.openCourseModalBtn = document.getElementById('openCourseModal');
        elements.saveTimetableBtn = document.getElementById('saveTimetableBtn');
        elements.resetBtn = document.getElementById('resetBtn');
        elements.addSectionBtn = document.getElementById('addSectionBtn');
        elements.sectionNameInput = document.getElementById('sectionName');
        elements.sectionsList = document.getElementById('sectionsList');
        elements.timetableContainer = document.getElementById('timetableContainer');
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
    }

    // Set up event listeners
    function setupEventListeners() {
        // Modal controls
        if (elements.openCourseModalBtn) {
            elements.openCourseModalBtn.addEventListener('click', showModal);
        }
        if (elements.closeModalBtn) {
            elements.closeModalBtn.addEventListener('click', hideModal);
        }
        if (elements.cancelCourseBtn) {
            elements.cancelCourseBtn.addEventListener('click', hideModal);
        }

        // Close modal when clicking outside
        if (elements.courseModal) {
            window.addEventListener('click', (e) => {
                if (e.target === elements.courseModal) {
                    hideModal();
                }
            });
        }
    }

    // Show modal function
    function showModal() {
        if (elements.courseModal) {
            // Prevent background scrolling
            const scrollY = window.scrollY;
            document.body.style.position = 'fixed';
            document.body.style.top = `-${scrollY}px`;
            document.body.style.width = '100%';
            document.body.classList.add('modal-open');
            
            // Show the modal
            elements.courseModal.style.display = 'block';
            
            // Store scroll position
            elements.courseModal.dataset.scrollY = scrollY;
            
            // Focus on first input if exists
            const firstInput = elements.courseModal.querySelector('input, select, textarea');
            if (firstInput) {
                setTimeout(() => firstInput.focus(), 100);
            }
        }
    }

    // Hide modal function
    function hideModal() {
        if (elements.courseModal) {
            // Restore body scrolling and position
            const scrollY = elements.courseModal.dataset.scrollY || '0';
            document.body.style.position = '';
            document.body.style.top = '';
            document.body.style.width = '';
            document.body.classList.remove('modal-open');
            
            // Hide the modal
            elements.courseModal.style.display = 'none';
            
            // Restore scroll position
            window.scrollTo(0, parseInt(scrollY || '0'));
        }
    }

    // Helper function to generate a random color
    function getRandomColor() {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }

    // Get selected days from checkboxes
    function getSelectedDays() {
        const days = [];
        const dayCheckboxes = document.querySelectorAll('.day-checkbox:checked');
        dayCheckboxes.forEach(checkbox => {
            days.push(checkbox.value);
        });
        return days;
    }

    // Check for time conflicts
    function hasTimeConflict(newCourse) {
        return state.courses.some(course => {
            if (course.sectionId !== newCourse.sectionId) return false;
            if (!course.days.some(day => newCourse.days.includes(day))) return false;
            
            const newStart = newCourse.startTime;
            const newEnd = newCourse.endTime;
            const existingStart = course.startTime;
            const existingEnd = course.endTime;
            
            return (newStart < existingEnd && newEnd > existingStart);
        });
    }

    // Reset course form
    function resetCourseForm() {
        if (elements.courseNameInput) elements.courseNameInput.value = '';
        if (elements.courseCodeInput) elements.courseCodeInput.value = '';
        if (elements.teacherNameInput) elements.teacherNameInput.value = '';
        if (elements.roomNumberInput) elements.roomNumberInput.value = '';
        if (elements.courseDurationInput) elements.courseDurationInput.value = '60';
        if (elements.startTimeInput) elements.startTimeInput.value = '09:00';
        if (elements.endTimeInput) elements.endTimeInput.value = '10:00';
        
        // Uncheck all day checkboxes
        document.querySelectorAll('.day-checkbox').forEach(checkbox => {
            checkbox.checked = false;
        });
    }

    // Update courses list in the UI
    function updateCoursesList() {
        const coursesList = document.getElementById('coursesList');
        if (!coursesList) return;
        
        coursesList.innerHTML = '';
        
        // If no section is selected, show message
        if (!state.currentSection) {
            coursesList.innerHTML = `
                <div class="no-courses">
                    <i class="fas fa-info-circle"></i>
                    <p>Please select a section first or create a new one.</p>
                </div>`;
            return;
        }
        
        // Filter courses for current section
        const sectionCourses = state.courses.filter(course => 
            course.sectionId === state.currentSection
        );
        
        if (sectionCourses.length === 0) {
            coursesList.innerHTML = '<p class="no-courses">No courses added yet. Click "Add Course" to get started.</p>';
            return;
        }
        
        sectionCourses.forEach((course, index) => {
            const teacher = state.teachers.find(t => t._id === course.teacherId);
            const section = state.sections.find(s => s._id === course.sectionId);
            
            const courseElement = document.createElement('div');
            courseElement.className = 'course-item';
            courseElement.style.borderLeft = `4px solid ${course.color}`;
            courseElement.dataset.courseId = course._id;
            
            courseElement.innerHTML = `
                <div class="course-info">
                    <h4>${course.name} (${course.code})</h4>
                    <p>Section: ${section?.name || 'N/A'}</p>
                    <p>Teacher: ${teacher?.name || 'Not assigned'}</p>
                    <p>Room: ${course.room || 'Not specified'}</p>
                    <p>Time: ${formatTime(course.startTime)} - ${formatTime(course.endTime)}</p>
                    <p>Days: ${course.days.join(', ').replace(/,([^,]*)$/, ' and$1')}</p>
                </div>
                <div class="course-actions">
                    <button class="edit-course" data-id="${course._id}">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="remove-course" data-id="${course._id}">
                        <i class="fas fa-trash"></i> Remove
                    </button>
                </div>
            `;
            
            coursesList.appendChild(courseElement);
        });
        
        // Add event listeners
        document.querySelectorAll('.remove-course').forEach(button => {
            button.addEventListener('click', (e) => {
                const courseId = e.target.closest('button').dataset.id;
                removeCourse(courseId);
            });
        });
        
        document.querySelectorAll('.edit-course').forEach(button => {
            button.addEventListener('click', (e) => {
                const courseId = e.target.closest('button').dataset.id;
                editCourse(courseId);
            });
        });
    }
    
    // Update teachers list in the UI
    function updateTeachersList() {
        const teachersList = document.getElementById('teachersList');
        if (!teachersList) return;
        
        teachersList.innerHTML = '';
        
        state.teachers.forEach(teacher => {
            const teacherElement = document.createElement('div');
            teacherElement.className = 'teacher-item';
            teacherElement.innerHTML = `
                <div class="teacher-info">
                    <h4>${teacher.name || 'Unnamed Teacher'}</h4>
                    <p>${teacher.email || 'No email'}</p>
                    <p>Courses: ${teacher.courses ? teacher.courses.length : 0}</p>
                </div>
            `;
            teachersList.appendChild(teacherElement);
        });
    }

    // Show error message
    function showError(message) {
        // Create notification element if it doesn't exist
        let notification = document.querySelector('.notification');
        if (!notification) {
            notification = document.createElement('div');
            notification.className = 'notification';
            document.body.appendChild(notification);
        }
        
        // Set message and show
        notification.textContent = message;
        notification.style.display = 'block';
        notification.style.opacity = '1';
        
        // Auto-hide after 3 seconds
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => {
                notification.style.display = 'none';
            }, 300);
        }, 3000);
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
        }
    }

    // Update sections list in the UI
    function updateSectionsList() {
        if (!elements.sectionsList) return;
        
        elements.sectionsList.innerHTML = '';
        state.sections.forEach(section => {
            addSectionToUI(section);
            
            // Update section selector in course form
            if (elements.sectionSelect) {
                const option = document.createElement('option');
                option.value = section._id;
                option.textContent = section.name;
                // Don't add duplicate options
                if (!Array.from(elements.sectionSelect.options).some(opt => opt.value === section._id)) {
                    elements.sectionSelect.appendChild(option);
                }
            }
        });
        
        // Update courses list when sections change
        updateCoursesList();
    }

    // Add section to UI
    function addSectionToUI(section) {
        if (!section || !elements.sectionsList) return;
        
        const sectionElement = document.createElement('div');
        sectionElement.className = 'section-tag' + (state.currentSection === section._id ? ' active' : '');
        sectionElement.dataset.sectionId = section._id;
        
        sectionElement.innerHTML = `
            <input type="radio" name="currentSection" ${state.currentSection === section._id ? 'checked' : ''}>
            <span>${section.name}</span>
            <button class="remove-section">×</button>
        `;
        
        // Add event listeners
        const radioInput = sectionElement.querySelector('input[type="radio"]');
        if (radioInput) {
            radioInput.addEventListener('change', () => {
                selectSection(section._id);
            });
        }
        
        const removeBtn = sectionElement.querySelector('.remove-section');
        if (removeBtn) {
            removeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                removeSection(section._id);
            });
        }
        
        elements.sectionsList.appendChild(sectionElement);
    }

    // Set up section management
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

    // Select a section
    async function selectSection(sectionId) {
        try {
            state.currentSection = sectionId;
            // Update UI to show selected section
            updateSectionsList();
            // Load section's timetable
            await loadTimetable(sectionId);
        } catch (error) {
            console.error('Error selecting section:', error);
            showError('Failed to select section');
        }
    }

    // Load timetable for a section
    async function loadTimetable(sectionId) {
        try {
            // This would be replaced with actual API call
            // const timetable = await timetableApi.getBySection(sectionId);
            console.log(`Loading timetable for section ${sectionId}...`);
            
            // Update UI with the loaded timetable
            if (elements.timetableContainer) {
                elements.timetableContainer.innerHTML = '<p>Timetable will be displayed here</p>';
            }
        } catch (error) {
            console.error('Error loading timetable:', error);
            showError('Failed to load timetable');
        }
    }

    // Generate timetable
    async function generateTimetable() {
        try {
            if (!state.currentSection) {
                showError('Please select a section first');
                return;
            }
            
            // This would be replaced with actual API call
            // const timetable = await timetableApi.generate(state.currentSection);
            console.log('Generating timetable...');
            
            // Update UI with the generated timetable
            if (elements.timetableContainer) {
                elements.timetableContainer.innerHTML = '<p>Generated timetable will be displayed here</p>';
            }
        } catch (error) {
            console.error('Error generating timetable:', error);
            showError('Failed to generate timetable');
        }
    }

    // Save timetable
    async function saveTimetable() {
        try {
            if (!state.currentSection) {
                showError('No section selected');
                return;
            }
            
            // This would be replaced with actual API call
            // await timetableApi.save(state.currentSection, state.timetables[state.currentSection]);
            console.log('Timetable saved successfully');
            showError('Timetable saved successfully');
        } catch (error) {
            console.error('Error saving timetable:', error);
            showError('Failed to save timetable');
        }
    }

    // Add a new course with teacher and section management
    async function addCourse(event) {
        try {
            // Prevent form submission if called from a form
            if (event) event.preventDefault();
            
            const form = document.getElementById('courseForm');
            if (!form) {
                showError('Form not found');
                return false;
            }
            
            // Get form elements
            const formElements = form.elements;
            const courseName = formElements.courseName?.value?.trim() || '';
            const courseCode = formElements.courseCode?.value?.trim() || '';
            const teacherName = formElements.teacherName?.value?.trim() || '';
            const teacherEmail = formElements.teacherEmail?.value?.trim() || '';
            const sectionId = formElements.sectionSelect?.value || '';
            const roomNumber = formElements.roomNumber?.value?.trim() || '';
            const courseDuration = parseInt(formElements.courseDuration?.value) || 60;
            const startTime = formElements.startTime?.value || '09:00';
            const endTime = formElements.endTime?.value || '10:00';
            
            // Basic validation
            if (!courseName || !courseCode || !teacherName || !sectionId) {
                showError('Please fill in all required fields');
                return false;
            }
            
            const selectedDays = getSelectedDays();
            if (selectedDays.length === 0) {
                showError('Please select at least one day');
                return false;
            }

            // Create course data object
            const courseData = {
                _id: generateId('course-'),
                name: courseName,
                code: courseCode.toUpperCase(),
                sectionId: sectionId,
                teacher: {
                    name: teacherName,
                    email: teacherEmail
                },
                room: roomNumber,
                duration: courseDuration,
                startTime: startTime,
                endTime: endTime,
                days: selectedDays,
                color: elements.courseColorInput ? elements.courseColorInput.value : getRandomColor()
            };

            // Validate input
            if (!courseData.name || !courseData.code || !courseData.teacher.name || !courseData.sectionId) {
                showError('Please fill in all required fields');
                return;
            }

            if (courseData.days.length === 0) {
                showError('Please select at least one day');
                return;
            }

            // Check for time conflicts
            if (hasTimeConflict(courseData)) {
                showError('This course conflicts with an existing course in the selected section');
                return;
            }

            // Add or update teacher
            let teacher = state.teachers.find(t => t.email === courseData.teacher.email);
            if (!teacher && courseData.teacher.email) {
                teacher = {
                    _id: generateId('teacher-'),
                    name: courseData.teacher.name,
                    email: courseData.teacher.email,
                    courses: []
                };
                state.teachers.push(teacher);
            } else if (teacher) {
                teacher.name = courseData.teacher.name; // Update name if email exists
            }

            // Add course to state
            const course = {
                ...courseData,
                teacherId: teacher?._id
            };
            state.courses.push(course);
            
            // Update teacher's courses
            if (teacher) {
                teacher.courses.push(course._id);
            }

            // Update UI
            updateCoursesList();
            updateTeachersList();
            
            // Reset form and hide modal
            resetCourseForm();
            hideModal();
            
            showError('Course added successfully');
        } catch (error) {
            console.error('Error adding course:', error);
            showError('Failed to add course');
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

    // Reset the form
    function resetForm() {
        if (!confirm('Are you sure you want to reset the form? This will clear all data.')) {
            return;
        }
        
        // Reset form inputs
        if (elements.sectionNameInput) elements.sectionNameInput.value = '';
        if (elements.courseNameInput) elements.courseNameInput.value = '';
        if (elements.courseCodeInput) elements.courseCodeInput.value = '';
        if (elements.teacherNameInput) elements.teacherNameInput.value = '';
        
        // Clear state
        state.sections = [];
        state.courses = [];
        state.currentSection = null;
        state.timetables = {};
        state.conflicts.clear();
        
        // Clear UI
        if (elements.sectionsList) elements.sectionsList.innerHTML = '';
        if (elements.timetableContainer) elements.timetableContainer.innerHTML = '';
        if (elements.sectionSelect) elements.sectionSelect.innerHTML = '<option value="">Select a section</option>';
        
        console.log('Form has been reset');
    }

    // Public API
    return {
        init: init,
        showModal: showModal,
        hideModal: hideModal,
        removeCourse: function(index) {
            if (state.courses && index >= 0 && index < state.courses.length) {
                state.courses.splice(index, 1);
            }
        },
        resetForm: resetForm
    };
})();

// Initialize the application when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    TimetableApp.init();
});
