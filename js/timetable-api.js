class TimetableAPI {
    constructor() {
        this.baseUrl = 'http://localhost:3000/api';
        this.token = localStorage.getItem('token');
    }

    getHeaders() {
        return {
            'Content-Type': 'application/json',
            ...(this.token && { 'Authorization': `Bearer ${this.token}` })
        };
    }

    async handleResponse(response) {
        if (response.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = 'login.html';
            return;
        }
        return response.json();
    }

    // Section methods
    async createSection(name, year = 1) {
        const response = await fetch(`${this.baseUrl}/sections`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify({ name, year })
        });
        return this.handleResponse(response);
    }

    async getSections() {
        const response = await fetch(`${this.baseUrl}/sections`, {
            headers: this.getHeaders()
        });
        return this.handleResponse(response);
    }

    async deleteSection(sectionId) {
        const response = await fetch(`${this.baseUrl}/sections/${sectionId}`, {
            method: 'DELETE',
            headers: this.getHeaders()
        });
        return this.handleResponse(response);
    }

    // Course methods
    async createCourse(courseData) {
        const response = await fetch(`${this.baseUrl}/courses`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify(courseData)
        });
        return this.handleResponse(response);
    }

    async getSectionCourses(sectionId) {
        const response = await fetch(`${this.baseUrl}/sections/${sectionId}/courses`, {
            headers: this.getHeaders()
        });
        return this.handleResponse(response);
    }

    async deleteCourse(courseId) {
        const response = await fetch(`${this.baseUrl}/courses/${courseId}`, {
            method: 'DELETE',
            headers: this.getHeaders()
        });
        return this.handleResponse(response);
    }

    // Timetable methods
    async generateTimetable(config) {
        const response = await fetch(`${this.baseUrl}/timetables/generate`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify(config)
        });
        return this.handleResponse(response);
    }

    async getTimetable(sectionId) {
        const response = await fetch(`${this.baseUrl}/sections/${sectionId}/timetable`, {
            headers: this.getHeaders()
        });
        return this.handleResponse(response);
    }

    async deleteTimetable(timetableId) {
        const response = await fetch(`${this.baseUrl}/timetables/${timetableId}`, {
            method: 'DELETE',
            headers: this.getHeaders()
        });
        return this.handleResponse(response);
    }
}

window.timetableAPI = new TimetableAPI();