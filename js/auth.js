// Authentication Module
const Auth = (function() {
    const API_BASE_URL = 'http://localhost:3000/api';
    
    // User roles
    const ROLES = {
        ADMIN: 'admin',
        TEACHER: 'teacher',
        STUDENT: 'student'
    };

    // Get token from localStorage
    function getToken() {
        return localStorage.getItem('token');
    }

    // Get current user from localStorage
    function getCurrentUser() {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    }

    // Check if user is authenticated
    function isAuthenticated() {
        const token = getToken();
        const user = getCurrentUser();
        return token && user;
    }

    // Make authenticated API request
    async function makeAuthenticatedRequest(url, options = {}) {
        const token = getToken();
        if (!token) {
            throw new Error('No authentication token');
        }

        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            ...options.headers
        };

        const response = await fetch(`${API_BASE_URL}${url}`, {
            ...options,
            headers
        });

        if (response.status === 401) {
            // Token expired or invalid
            logout();
            throw new Error('Authentication failed');
        }

        return response;
    }

    // Verify current token
    async function verifyToken() {
        try {
            const token = getToken();
            if (!token) return false;
            
            const response = await makeAuthenticatedRequest('/verify');
            const data = await response.json();
            
            return response.ok && data.success;
        } catch (error) {
            console.error('Token verification failed:', error);
            return false;
        }
    }

    // Logout function
    function logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = 'login.html';
    }

    // Check if user has required role
    function hasRole(requiredRole) {
        const user = getCurrentUser();
        if (!user) return false;
        return user.role === requiredRole;
    }

    // Get sections
    async function getSections() {
        try {
            const response = await makeAuthenticatedRequest('/sections');
            const data = await response.json();
            return data.success ? data.data : [];
        } catch (error) {
            console.error('Failed to fetch sections:', error);
            return [];
        }
    }

    // Create section
    async function createSection(sectionData) {
        try {
            const response = await makeAuthenticatedRequest('/sections', {
                method: 'POST',
                body: JSON.stringify(sectionData)
            });
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Failed to create section:', error);
            throw error;
        }
    }

    // Get courses by section
    async function getCoursesBySection(sectionId) {
        try {
            const response = await makeAuthenticatedRequest(`/sections/${sectionId}/courses`);
            const data = await response.json();
            return data.success ? data.data : [];
        } catch (error) {
            console.error('Failed to fetch courses:', error);
            return [];
        }
    }

    // Create course
    async function createCourse(courseData) {
        try {
            const response = await makeAuthenticatedRequest('/courses', {
                method: 'POST',
                body: JSON.stringify(courseData)
            });
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Failed to create course:', error);
            throw error;
        }
    }

    return {
        isAuthenticated,
        getCurrentUser,
        getToken,
        verifyToken,
        logout,
        hasRole,
        getSections,
        createSection,
        getCoursesBySection,
        createCourse,
        makeAuthenticatedRequest,
        ROLES
    };
})();

// Initialize auth on page load
document.addEventListener('DOMContentLoaded', async function() {
    // Protect routes that require authentication
    const protectedRoutes = ['timetable-generator.html', 'profile.html'];
    const currentPage = window.location.pathname.split('/').pop();
    
    // Check authentication status
    const isAuth = Auth.isAuthenticated();
    
    if (protectedRoutes.includes(currentPage)) {
        if (!isAuth) {
            window.location.href = 'login.html';
            return;
        }
        
        // Verify token is still valid
        const tokenValid = await Auth.verifyToken();
        if (!tokenValid) {
            Auth.logout();
            return;
        }
    }
    
    // Update navigation based on auth state
    updateNavigation(isAuth);
    
    // Setup logout handler
    const signoutBtn = document.querySelector('.signout-btn');
    if (signoutBtn) {
        signoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            Auth.logout();
        });
    }
});

// Update navigation based on authentication state
function updateNavigation(isAuthenticated) {
    const loginLink = document.querySelector('.login-link');
    const signoutBtn = document.querySelector('.signout-btn');
    
    if (isAuthenticated) {
        if (loginLink) loginLink.style.display = 'none';
        if (signoutBtn) signoutBtn.style.display = 'block';
        
        const user = Auth.getCurrentUser();
        if (user) {
            const userElements = document.querySelectorAll('.user-name');
            userElements.forEach(el => {
                el.textContent = user.name;
            });
        }
    } else {
        if (loginLink) loginLink.style.display = 'block';
        if (signoutBtn) signoutBtn.style.display = 'none';
    }
}
