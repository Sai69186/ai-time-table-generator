// Timetable API functions
const API_BASE = 'http://localhost:3000/api';

// Get auth headers
function getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
    };
}

// Handle API response
async function handleResponse(response) {
    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Network error' }));
        throw { status: response.status, ...error };
    }
    return response.json();
}

// API functions
const TimetableAPI = {
    // Sections
    async getSections() {
        try {
            const response = await fetch(`${API_BASE}/sections`, {
                headers: getAuthHeaders()
            });
            return await handleResponse(response);
        } catch (error) {
            handleApiError(error, 'getSections');
            return { success: false, data: [] };
        }
    },

    async createSection(name) {
        try {
            const response = await fetch(`${API_BASE}/sections`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({ name })
            });
            return await handleResponse(response);
        } catch (error) {
            handleApiError(error, 'createSection');
            return { success: false };
        }
    },

    // Teachers
    async getTeachers() {
        try {
            const response = await fetch(`${API_BASE}/university/teachers`, {
                headers: getAuthHeaders()
            });
            return await handleResponse(response);
        } catch (error) {
            handleApiError(error, 'getTeachers');
            return { success: false, data: [] };
        }
    },

    // Courses
    async getCourses() {
        try {
            const response = await fetch(`${API_BASE}/courses`, {
                headers: getAuthHeaders()
            });
            return await handleResponse(response);
        } catch (error) {
            handleApiError(error, 'getCourses');
            return { success: false, data: [] };
        }
    },

    async createCourse(courseData) {
        try {
            const response = await fetch(`${API_BASE}/courses`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify(courseData)
            });
            return await handleResponse(response);
        } catch (error) {
            handleApiError(error, 'createCourse');
            return { success: false };
        }
    }
};