const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

const SALT_ROUNDS = 10; // Cost factor for hashing

// Controller function for user registration
const registerUser = async (req, res, next) => {
    const { username, password } = req.body;

    // Basic validation
    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }

    try {
        // Check if user already exists
        const userExists = await db.query('SELECT * FROM users WHERE username = $1', [username]);
        if (userExists.rows.length > 0) {
            return res.status(409).json({ message: 'Username already taken' });
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

        // Insert new user (default role is 'user')
        const newUser = await db.query(
            'INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING user_id, username, role',
            [username, passwordHash]
        );

        res.status(201).json({ 
            message: 'User registered successfully', 
            user: newUser.rows[0] 
        });

    } catch (error) {
        console.error('Registration error:', error);
        // Pass unexpected errors to the central error handler
        next(error);
    }
};

// Controller function for user login
const loginUser = async (req, res, next) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }

    try {
        // Find user by username
        const result = await db.query('SELECT * FROM users WHERE username = $1', [username]);
        const user = result.rows[0];

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' }); // User not found
        }

        // Compare password with hash
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' }); // Incorrect password
        }

        // --- Generate JWT ---
        // The payload contains essential, non-sensitive user info for authorization checks
        const payload = {
            userId: user.user_id,
            role: user.role,
            // Avoid adding sensitive information here
        };

        const token = jwt.sign(
            payload, 
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '1h' } // Use expiration from .env or default
        );

        res.json({ 
            message: 'Login successful', 
            token,
            userId: user.user_id,
            role: user.role
        });

    } catch (error) {
        console.error('Login error:', error);
        // Pass unexpected errors to the central error handler
        next(error);
    }
};

module.exports = {
    registerUser,
    loginUser,
}; 