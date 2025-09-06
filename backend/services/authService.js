const User = require('../models/User');
const jwt = require('jsonwebtoken');

class AuthService {
    generateToken(userId) {
        return jwt.sign({ userId }, process.env.JWT_SECRET || 'fallback_secret', {
            expiresIn: '7d'
        });
    }

    async register(userData) {
        const { name, email, password } = userData;
        
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            throw new Error('User already exists');
        }

        const user = new User({ name, email, password });
        await user.save();

        const token = this.generateToken(user._id);
        return {
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            },
            token
        };
    }

    async login(email, password) {
        const user = await User.findOne({ email });
        if (!user) {
            throw new Error('Invalid credentials');
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            throw new Error('Invalid credentials');
        }

        const token = this.generateToken(user._id);
        return {
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            },
            token
        };
    }
}

module.exports = new AuthService();