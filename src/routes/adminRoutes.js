const express = require('express');
const { updateUserRole } = require('../controllers/adminController');
const { superAdminAuth } = require('../middlewares/authMiddleware');

const router = express.Router();

// --- Super Admin User Management ---
// Route to update a user's role to admin using special credentials
// PUT /api/admin/users/role
// Requires: Basic Auth using ADMIN_USERNAME/ADMIN_PASSWORD from .env (superAdminAuth)
router.put('/users/role', superAdminAuth, updateUserRole);


module.exports = router; 