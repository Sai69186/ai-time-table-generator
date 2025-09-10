// Global error handler for API calls
window.addEventListener('unhandledrejection', function(event) {
    console.error('Unhandled promise rejection:', event.reason);
});

// API error handler
function handleApiError(error, context = '') {
    console.error(`API Error ${context}:`, error);
    
    if (error.message && error.message.includes('Failed to fetch')) {
        showNotification('Server is not running. Please start the backend server.', 'error');
        return;
    }
    
    if (error.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = 'login.html';
        return;
    }
    
    showNotification('An error occurred. Please try again.', 'error');
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 5px;
        color: white;
        z-index: 10000;
        max-width: 300px;
        font-weight: 500;
    `;
    
    if (type === 'error') {
        notification.style.backgroundColor = '#e74c3c';
    } else if (type === 'success') {
        notification.style.backgroundColor = '#27ae60';
    } else {
        notification.style.backgroundColor = '#3498db';
    }
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 5000);
}