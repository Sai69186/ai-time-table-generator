const authService = require('../services/authService');

class AuthController {
    async register(req, res) {
        try {
            const { name, email, password } = req.body;

            if (!name || !email || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'Please provide all required fields'
                });
            }

            const result = await authService.register({ name, email, password });
            
            res.status(201).json({
                success: true,
                message: 'User registered successfully',
                data: result
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    async login(req, res) {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'Please provide email and password'
                });
            }

            const result = await authService.login(email, password);
            
            res.json({
                success: true,
                message: 'Login successful',
                data: result
            });
        } catch (error) {
            res.status(401).json({
                success: false,
                message: error.message
            });
        }
    }
}

module.exports = new AuthController();