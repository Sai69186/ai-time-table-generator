// University Timetable API
window.timetableAPI = {
    baseUrl: 'http://localhost:3000/api/university',
    
    getHeaders() {
        const token = localStorage.getItem('token');
        return {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
        };
    },
    
    async handleResponse(response) {
        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Network error' }));
            throw { status: response.status, ...error };
        }
        return response.json();
    },
    
    // Branch operations
    async createBranch(name, code) {
        try {
            const response = await fetch(`${this.baseUrl}/branches`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify({ name, code })
            });
            return await this.handleResponse(response);
        } catch (error) {
            console.error('Error creating branch:', error);
            return { success: false, detail: error.message };
        }
    },
    
    async getBranches() {
        try {
            const response = await fetch(`${this.baseUrl}/branches`, {
                headers: this.getHeaders()
            });
            return await this.handleResponse(response);
        } catch (error) {
            console.error('Error fetching branches:', error);
            return { success: false, data: [] };
        }
    },
    
    // Section operations
    async createUniversitySection(sectionData) {
        try {
            const response = await fetch(`${this.baseUrl}/sections`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(sectionData)
            });
            return await this.handleResponse(response);
        } catch (error) {
            console.error('Error creating section:', error);
            return { 
                success: false, 
                detail: error.message || 'Failed to create section',
                error: error
            };
        }
    },
    
    async getSections() {
        try {
            const token = localStorage.getItem('token');
            const headers = {};
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
            const response = await fetch(`${this.baseUrl}/sections`, { headers });
            const result = await this.handleResponse(response);
            return result || { success: false, data: [] };
        } catch (error) {
            console.error('Error fetching sections:', error);
            return { success: false, data: [] };
        }
    },
    
    // Teacher operations
    async createTeacher(teacherData) {
        try {
            // Handle both object and individual parameter formats
            let name, employee_id, department, max_hours_per_day;
            
            if (typeof teacherData === 'object' && teacherData !== null) {
                // Object format: {name, employee_id, department, max_hours_per_day}
                ({ 
                    name, 
                    employee_id, 
                    department = 'General', 
                    max_hours_per_day = 6 
                } = teacherData);
            } else {
                // Individual parameters (for backward compatibility)
                [
                    name, 
                    employee_id, 
                    department = 'General', 
                    max_hours_per_day = 6
                ] = arguments;
            }

            if (!name || !employee_id) {
                throw { status: 400, message: 'Name and employee_id are required' };
            }

            const response = await fetch(`${this.baseUrl}/teachers`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify({ 
                    name, 
                    employee_id,
                    department,
                    max_hours_per_day
                })
            });
            return this.handleResponse(response);
        } catch (error) {
            console.error('Error creating teacher:', error);
            throw error;
        }
    },

    async getTeachers() {
        try {
            const response = await fetch(`${this.baseUrl}/teachers`, {
                headers: this.getHeaders()
            });
            return this.handleResponse(response);
        } catch (error) {
            console.error('Error fetching teachers:', error);
            throw error;
        }
    },

    async updateTeacher(teacherId, updates) {
        try {
            // In a real implementation, we would update the teacher on the server
            // For now, we'll simulate this by getting all teachers and updating locally
            const { data: teachers } = await this.getTeachers();
            const teacher = teachers.find(t => t.id === teacherId);
            if (!teacher) {
                throw { status: 404, message: 'Teacher not found' };
            }
            const updatedTeacher = { ...teacher, ...updates };
            // In a real app, we would make a PUT request to update the teacher
            // const response = await fetch(`${this.baseUrl}/teachers/${teacherId}`, {
            //     method: 'PUT',
            //     headers: this.getHeaders(),
            //     body: JSON.stringify(updatedTeacher)
            // });
            // return this.handleResponse(response);
            return { success: true, data: updatedTeacher };
        } catch (error) {
            console.error('Error updating teacher:', error);
            throw error;
        }
    },

    async deleteTeacher(teacherId) {
        try {
            // In a real implementation, we would delete the teacher on the server
            // For now, we'll simulate this by getting all teachers and filtering locally
            const { data: teachers } = await this.getTeachers();
            const teacherExists = teachers.some(t => t.id === teacherId);
            if (!teacherExists) {
                throw { status: 404, message: 'Teacher not found' };
            }
            // In a real app, we would make a DELETE request
            // const response = await fetch(`${this.baseUrl}/teachers/${teacherId}`, {
            //     method: 'DELETE',
            //     headers: this.getHeaders()
            // });
            // return this.handleResponse(response);
            return { success: true, message: 'Teacher deleted successfully' };
        } catch (error) {
            console.error('Error deleting teacher:', error);
            throw error;
        }
    },
    
    // Room operations
    async createRoom(roomData) {
        try {
            const response = await fetch(`${this.baseUrl}/rooms/public`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(roomData)
            });
            return await this.handleResponse(response);
        } catch (error) {
            console.error('Error creating room:', error);
            return { success: false, detail: error.message };
        }
    },
    
    async getRooms() {
        try {
            const response = await fetch(`${this.baseUrl}/rooms/public`);
            return await this.handleResponse(response);
        } catch (error) {
            console.error('Error fetching rooms:', error);
            return { success: false, data: [] };
        }
    },
    
    // Subject operations
    async createSubject(subjectData) {
        try {
            const response = await fetch(`${this.baseUrl}/subjects/public`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(subjectData)
            });
            return await this.handleResponse(response);
        } catch (error) {
            console.error('Error creating subject:', error);
            return { success: false, detail: error.message };
        }
    },
    
    async getSubjects() {
        try {
            const response = await fetch(`${this.baseUrl}/subjects/public`);
            return await this.handleResponse(response);
        } catch (error) {
            console.error('Error fetching subjects:', error);
            return { success: false, data: [] };
        }
    },
    
    // Course operations
    async createCourse(courseData) {
        try {
            const response = await fetch(`${this.baseUrl}/courses/public`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(courseData)
            });
            return await this.handleResponse(response);
        } catch (error) {
            console.error('Error creating course:', error);
            return { success: false, detail: error.message };
        }
    },
    
    async getCourses() {
        try {
            const response = await fetch(`${this.baseUrl}/courses/public`);
            return await this.handleResponse(response);
        } catch (error) {
            console.error('Error fetching courses:', error);
            return { success: false, data: [] };
        }
    },
    
    // Timetable operations
    async generateUniversityTimetable(config) {
        try {
            const response = await fetch(`${this.baseUrl}/timetables/generate`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(config)
            });
            const result = await this.handleResponse(response);
            if (!result.success) {
                console.error('Timetable generation failed:', result);
                return { 
                    success: false, 
                    detail: result.message || 'Failed to generate timetable',
                    error: result
                };
            }
            return result;
        } catch (error) {
            console.error('Error generating timetable:', error);
            return { 
                success: false, 
                detail: error.message || 'Failed to generate timetable',
                error: error
            };
        }
    },
    
    // Logout
    async logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = 'index.html';
    }
};