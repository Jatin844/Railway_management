require('dotenv').config(); // Load .env variables before anything else
const express = require('express');

// --- Import Route Handlers ---
const authRoutes = require('./routes/authRoutes');
const trainRoutes = require('./routes/trainRoutes'); // Handles /api/admin/trains and /api/trains/availability
const bookingRoutes = require('./routes/bookingRoutes');
const adminRoutes = require('./routes/adminRoutes');   // Handles /api/admin/users/role

// --- App Initialization ---
const app = express();
const PORT = process.env.PORT || 3000;

// --- Core Middleware ---
// Enable parsing of JSON request bodies
app.use(express.json());

// Simple request logger (consider using Morgan for more advanced logging)
app.use((req, res, next) => {
    // Log timestamp, HTTP method, URL, and status code (after response finishes)
    const start = Date.now();
    res.on('finish', () => { 
        const duration = Date.now() - start;
        console.log(`${new Date().toISOString()} | ${req.method} ${req.originalUrl} | ${res.statusCode} | ${duration}ms`);
    });
    next();
});

// --- API Routes ---
// Simple health check / root route
app.get('/', (req, res) => {
    res.send('Railway Management System API is running!');
});

// Mount application routes
// Order can matter depending on path specificity, although less critical here.
app.use('/api/auth', authRoutes);        // Authentication endpoints (register, login)
app.use('/api', trainRoutes);           // Train endpoints (add train, get availability) 
app.use('/api/bookings', bookingRoutes); // Booking endpoints (book seat, get details)
app.use('/api/admin', adminRoutes);       // Admin-specific endpoints (update role)


// --- Error Handling Middleware ---
// Catch-all for routes not handled above (404 Not Found)
// IMPORTANT: This should come *after* all valid routes
app.use((req, res, next) => {
    // Create an error object for consistent handling by the final error middleware
    const error = new Error('Resource Not Found');
    error.status = 404;
    next(error); 
});

// Centralized error handler
// IMPORTANT: This MUST be the LAST middleware defined
// Catches errors passed via next(error) from controllers or previous middleware
app.use((err, req, res, next) => {
    console.error("===== Unhandled Error ====");
    console.error("Timestamp:", new Date().toISOString());
    console.error("Route:", req.method, req.originalUrl);
    console.error("Error Stack:", err.stack || err);
    console.error("=========================");

    // Determine status code: use error's status or default to 500
    const statusCode = err.status || 500;
    // Determine message: use error's message or a generic one
    // Avoid leaking sensitive stack traces in production environments
    const message = statusCode === 500 && process.env.NODE_ENV === 'production' 
                    ? 'Internal Server Error' 
                    : err.message || 'Internal Server Error';

    res.status(statusCode).json({ 
        message: message, 
        // Optionally include stack trace in development
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined 
    });
});

// --- Start Server ---
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
    console.log(`Access API at: http://localhost:${PORT}`);
});

module.exports = app; // Export app for potential testing 