const express = require('express');
const { bookSeat, getBookingDetails } = require('../controllers/bookingController');
const { jwtAuth } = require('../middlewares/authMiddleware');

const router = express.Router();

// Route for a user to book a seat
// POST /api/bookings
// Requires JWT authentication
router.post('/', jwtAuth, bookSeat);

// Route for a user to get details of a specific booking
// GET /api/bookings/:booking_id
// Requires JWT authentication (controller handles authorization check)
router.get('/:booking_id', jwtAuth, getBookingDetails);

module.exports = router; 