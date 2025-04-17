const express = require('express');
const { addTrain, getSeatAvailability } = require('../controllers/trainController');
const { apiKeyAuth, jwtAuth, adminOnly } = require('../middlewares/authMiddleware');

const router = express.Router();

// --- Admin Train Management ---
// POST /api/admin/trains
// Requires: Valid API Key (apiKeyAuth), Logged-in User (jwtAuth), User is Admin (adminOnly)
router.post('/admin/trains', apiKeyAuth, jwtAuth, adminOnly, addTrain);

// --- Public Train Information ---
// GET /api/trains/availability?source=StationA&destination=StationB
// Publicly accessible route to check seat availability.
router.get('/trains/availability', getSeatAvailability); // No auth needed for checking availability

module.exports = router; 