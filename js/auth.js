// Authentication Module
const Auth = (function() {
    // Current user data
    let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
    
    // User roles
    const ROLES = {
        ADMIN: 'admin',
        TEACHER: 'teacher',
        STUDENT: 'student'
    };

    // Check if user is authenticated
    function isAuthenticated() {
        return currentUser !== null;
    }

    // Get current user
    function getCurrentUser() {
        return currentUser;
    }

    // Login function
    function login(email, password) {
        // In a real app, this would be an API call
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const user = users.find(u => u.email === email && u.password === password);
        
        if (user) {
            currentUser = user;
            localStorage.setItem('currentUser', JSON.stringify(user));
            return true;
        }
        return false;
    }

    // Register new user
    function register(userData) {
        const users = JSON.parse(localStorage.getItem('users')) || [];
        
        // Check if user already exists
        if (users.some(u => u.email === userData.email)) {
            return { success: false, message: 'User already exists' };
        }

        // Add new user
        const newUser = {
            id: 'user-' + Date.now(),
            ...userData,
            role: ROLES.TEACHER // Default role
        };

        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        
        // Auto login
        currentUser = newUser;
        localStorage.setItem('currentUser', JSON.stringify(newUser));
        
        return { success: true, user: newUser };
    }

    // Logout function
    function logout() {
        currentUser = null;
        localStorage.removeItem('currentUser');
        window.location.href = 'login.html';
    }

    // Check if user has required role
    function hasRole(requiredRole) {
        if (!currentUser) return false;
        return currentUser.role === requiredRole;
    }

    return {
        isAuthenticated,
        getCurrentUser,
        login,
        register,
        logout,
        hasRole,
        ROLES
    };
})();

// Initialize auth on page load
document.addEventListener('DOMContentLoaded', function() {
    // Protect routes that require authentication
    const protectedRoutes = ['timetable-generator.html', 'profile.html'];
    const currentPage = window.location.pathname.split('/').pop();
    
    if (protectedRoutes.includes(currentPage) && !Auth.isAuthenticated()) {
        window.location.href = 'login.html';
    }
    
    // Update UI based on authentication state
    const authElements = document.querySelectorAll('[data-auth]');
    authElements.forEach(el => {
        const authState = el.getAttribute('data-auth');
        const shouldShow = (authState === 'authenticated' && Auth.isAuthenticated()) || 
                         (authState === 'unauthenticated' && !Auth.isAuthenticated());
        el.style.display = shouldShow ? 'block' : 'none';
    });
});
