require('dotenv').config();
const jwt = require('jsonwebtoken');

/**
 * Middleware: apiKeyAuth
 * Verifies the presence and validity of an Admin API Key.
 * Expects the key in the 'X-API-Key' header.
 */
const apiKeyAuth = (req, res, next) => {
    const apiKey = req.headers['x-api-key']; // Standard header for API keys

    if (!apiKey) {
        return res.status(401).json({ message: 'Unauthorized: API Key is missing' });
    }

    if (apiKey !== process.env.ADMIN_API_KEY) {
        return res.status(403).json({ message: 'Forbidden: Invalid API Key' });
    }

    next(); // API Key is valid, proceed
};

/**
 * Middleware: jwtAuth
 * Verifies a JSON Web Token (JWT) sent in the Authorization header.
 * Expects format: "Authorization: Bearer <token>"
 * Attaches the decoded token payload (user info) to `req.user` on success.
 */
const jwtAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Unauthorized: Token is missing or invalid format' });
    }

    const token = authHeader.split(' ')[1]; // Extract token

    try {
        // Verify the token using the secret key from .env
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // Attach decoded user payload (e.g., { userId: 1, role: 'admin' }) to the request object
        // so subsequent middleware/controllers can access it.
        req.user = decoded; 
        next(); // Token is valid, proceed
    } catch (error) {
        // Handle specific JWT errors
        if (error.name === 'TokenExpiredError') {
             return res.status(401).json({ message: 'Unauthorized: Token expired' });
        }
        if (error.name === 'JsonWebTokenError') {
            // Covers invalid signature, malformed token, etc.
            return res.status(401).json({ message: 'Unauthorized: Invalid token' });
        }
        // Handle other unexpected errors during verification
        console.error("JWT Verification Error:", error);
        // Pass to central error handler instead of sending 500 directly
        next(error); 
    }
};

/**
 * Middleware: adminOnly
 * Checks if the authenticated user (attached by jwtAuth) has the 'admin' role.
 * IMPORTANT: This middleware MUST run *after* jwtAuth.
 */
const adminOnly = (req, res, next) => {
    // This middleware should run *after* jwtAuth
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Forbidden: Admin access required' });
    }
    next(); // User is an admin
};

/**
 * Middleware: superAdminAuth
 * Verifies credentials using HTTP Basic Authentication.
 * Expects format: "Authorization: Basic <base64(username:password)>"
 * Compares against ADMIN_USERNAME and ADMIN_PASSWORD from .env.
 */
const superAdminAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Basic ')) {
        res.setHeader('WWW-Authenticate', 'Basic realm="Super Admin Area"');
        return res.status(401).json({ message: 'Unauthorized: Basic Authentication required' });
    }

    const credentials = Buffer.from(authHeader.split(' ')[1], 'base64').toString('ascii');
    const [username, password] = credentials.split(':');

    const adminUser = process.env.ADMIN_USERNAME;
    const adminPass = process.env.ADMIN_PASSWORD;

    if (!adminUser || !adminPass) {
        console.error('ADMIN_USERNAME or ADMIN_PASSWORD not set in .env');
        return res.status(500).json({ message: 'Server configuration error' });
    }

    if (username === adminUser && password === adminPass) {
        next(); // Credentials match
    } else {
        res.setHeader('WWW-Authenticate', 'Basic realm="Super Admin Area"');
        return res.status(403).json({ message: 'Forbidden: Invalid credentials' });
    }
};

module.exports = {
    apiKeyAuth,
    jwtAuth,
    adminOnly,
    superAdminAuth
}; 