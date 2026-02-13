const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

const authController = {
    register: async (req, res) => {
        try {
            const { username, email, password } = req.body;

            if (!username || !email || !password) {
                return res.status(400).json({ message: 'All fields are required' });
            }

            const existingUser = await User.findByEmail(email);
            if (existingUser) {
                return res.status(409).json({ message: 'User already exists' });
            }

            await User.create(username, email, password);
            res.status(201).json({ message: 'User registered successfully' });
        } catch (error) {
            console.error('Registration error:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    },

    login: async (req, res) => {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({ message: 'Email and password are required' });
            }

            const user = await User.findByEmail(email);
            if (!user) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }

            const isValid = await User.validatePassword(password, user.password);
            if (!isValid) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }

            const token = jwt.sign(
                { userId: user.id, username: user.username },
                JWT_SECRET,
                { expiresIn: '1h' }
            );

            res.json({ token, user: { id: user.id, username: user.username, email: user.email } });
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }
};

module.exports = authController;
