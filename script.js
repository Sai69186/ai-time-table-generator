// This file is kept for compatibility but main logic is in index.html
// Check authentication and redirect function
function checkAuthAndRedirect(url) {
    if (Auth.isAuthenticated()) {
        window.location.href = url;
    } else {
        alert('Please login to access the Timetable Generator.');
        window.location.href = 'login.html';
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const generateBtn = document.getElementById('generateBtn');
    
    // Only add event listener if the button exists
    if (generateBtn) {
        generateBtn.addEventListener('click', function() {
            checkAuthAndRedirect('timetable-generator.html');
        });
    }
});
