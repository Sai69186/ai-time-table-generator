const express = require('express');
const router = express.Router();

// Simple auth routes
router.post('/login', (req, res) => {
    const { email, password } = req.body;
    
    if (!email || !password) {
        return res.status(400).json({ success: false, detail: 'Email and password are required' });
    }
    
    // Simple validation - accept any email/password for demo
    if (email && password) {
        res.json({ 
            success: true, 
            access_token: `token_${Date.now()}`, 
            user: { id: 1, name: 'Test User', email } 
        });
    } else {
        res.status(401).json({ success: false, detail: 'Invalid credentials' });
    }
});

router.post('/register', (req, res) => {
    const { name, email, password } = req.body;
    
    if (!name || !email || !password) {
        return res.status(400).json({ success: false, detail: 'Name, email, and password are required' });
    }
    
    if (password.length < 6) {
        return res.status(400).json({ success: false, detail: 'Password must be at least 6 characters' });
    }
    
    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ success: false, detail: 'Please enter a valid email address' });
    }
    
    res.json({ 
        success: true, 
        access_token: `token_${Date.now()}`,
        user: { id: Date.now(), name, email }
    });
});

router.post('/logout', (req, res) => {
    res.json({ success: true, message: 'Logged out successfully' });
});

// Health check for auth
router.get('/health', (req, res) => {
    res.json({ success: true, message: 'Auth API is healthy' });
});

module.exports = router;