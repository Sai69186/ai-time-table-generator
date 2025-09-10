// API test functions
async function testAPI() {
    console.log('Testing API endpoints...');
    
    // Test health endpoint
    try {
        const response = await fetch('http://localhost:3000/api/health');
        const data = await response.json();
        console.log('Health check:', data);
    } catch (error) {
        console.error('Health check failed:', error);
        showNotification('Backend server is not running', 'error');
        return;
    }
    
    // Test auth status
    const token = localStorage.getItem('token');
    if (token) {
        try {
            const response = await fetch('http://localhost:3000/api/verify', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            console.log('Auth status:', data);
        } catch (error) {
            console.error('Auth verification failed:', error);
        }
    }
}

// Run API test on page load
document.addEventListener('DOMContentLoaded', function() {
    // Only test API on timetable generator page
    if (window.location.pathname.includes('timetable-generator')) {
        testAPI();
    }
});