// Navigation Module
const Navigation = (function() {
    // Initialize navigation
    function init() {
        updateNavAuthState();
        setupEventListeners();
    }

    // Update navigation based on authentication state
    function updateNavAuthState() {
        const user = Auth.getCurrentUser();
        const nav = document.querySelector('nav');
        
        if (!nav) return;
        
        // Update auth-specific elements
        const authElements = nav.querySelectorAll('[data-auth]');
        authElements.forEach(el => {
            const authState = el.getAttribute('data-auth');
            const shouldShow = (authState === 'authenticated' && user) || 
                             (authState === 'unauthenticated' && !user);
            el.style.display = shouldShow ? 'block' : 'none';
        });
        
        // Update user info
        const userInfo = nav.querySelector('.user-info');
        if (userInfo && user) {
            userInfo.innerHTML = `
                <div class="user-avatar">${user.name.charAt(0).toUpperCase()}</div>
                <span class="user-name">${user.name}</span>
                <i class="fas fa-chevron-down"></i>
                <div class="dropdown-menu">
                    <a href="profile.html"><i class="fas fa-user"></i> Profile</a>
                    <a href="settings.html"><i class="fas fa-cog"></i> Settings</a>
                    <div class="divider"></div>
                    <a href="#" id="logoutBtn"><i class="fas fa-sign-out-alt"></i> Logout</a>
                </div>
            `;
        }
    }

    // Setup event listeners
    function setupEventListeners() {
        // Logout button
        document.addEventListener('click', function(e) {
            if (e.target.closest('#logoutBtn') || e.target.closest('.signout-btn')) {
                e.preventDefault();
                if (confirm('Are you sure you want to sign out?')) {
                    Auth.logout();
                }
            }
            
            // Mobile menu toggle
            if (e.target.closest('.mobile-menu-btn')) {
                const nav = document.querySelector('nav');
                nav.classList.toggle('mobile-visible');
            }
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', function(e) {
            if (!e.target.closest('.user-info')) {
                const dropdowns = document.querySelectorAll('.dropdown-menu');
                dropdowns.forEach(dropdown => {
                    dropdown.classList.remove('show');
                });
            }
        });
        
        // Toggle dropdown
        document.addEventListener('click', function(e) {
            const userInfo = e.target.closest('.user-info');
            if (userInfo) {
                const dropdown = userInfo.querySelector('.dropdown-menu');
                if (dropdown) {
                    dropdown.classList.toggle('show');
                }
            }
        });
    }
    
    return {
        init
    };
})();

// Initialize navigation when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    Navigation.init();
});
