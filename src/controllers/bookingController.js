const db = require('../config/db');

// Controller function to book a seat using a database transaction
const bookSeat = async (req, res, next) => {
    const { train_id, booking_date } = req.body; // Expecting train_id and date (YYYY-MM-DD)
    const user_id = req.user.userId; // Extracted from jwtAuth middleware

    if (!train_id || !booking_date) {
        return res.status(400).json({ message: 'train_id and booking_date are required' });
    }

    // Validate date format if necessary (basic check)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(booking_date)) {
        return res.status(400).json({ message: 'Invalid date format. Use YYYY-MM-DD.' });
    }

    // Get a dedicated client from the pool to manage the transaction
    const client = await db.getClient(); 

    try {
        // Start the transaction
        await client.query('BEGIN');

        // Lock the specific train row for the duration of the transaction.
        // This prevents other concurrent transactions from reading outdated seat counts
        // or booking the last seat simultaneously. Crucial for preventing race conditions.
        // It also implicitly checks if the train exists.
        const trainResult = await client.query(
            'SELECT total_seats FROM trains WHERE train_id = $1 FOR UPDATE',
            [train_id]
        );

        if (trainResult.rows.length === 0) {
            await client.query('ROLLBACK'); // Abort transaction
            return res.status(404).json({ message: 'Train not found' });
        }
        const totalSeats = trainResult.rows[0].total_seats;

        // Count bookings *within the transaction* to get the current count
        const bookingCountResult = await client.query(
            'SELECT COUNT(*) AS booked_count FROM bookings WHERE train_id = $1 AND booking_date = $2',
            [train_id, booking_date]
        );
        const bookedCount = parseInt(bookingCountResult.rows[0].booked_count);

        // Check availability
        if (bookedCount >= totalSeats) {
            await client.query('ROLLBACK'); // Abort transaction
            return res.status(409).json({ message: 'No seats available on this train for the selected date' });
        }

        // Attempt to insert the booking within the transaction
        // The UNIQUE constraint (user_id, train_id, booking_date) in the DB schema 
        // automatically prevents a user from double-booking the same train on the same date.
        try {
            const newBooking = await client.query(
                'INSERT INTO bookings (user_id, train_id, booking_date) VALUES ($1, $2, $3) RETURNING booking_id',
                [user_id, train_id, booking_date]
            );
            
            // If insertion is successful, commit the transaction
            await client.query('COMMIT');
            res.status(201).json({ 
                message: 'Seat booked successfully!', 
                booking_id: newBooking.rows[0].booking_id 
            });

        } catch (insertError) {
             // If insert fails (e.g., unique constraint violation), rollback the transaction
             await client.query('ROLLBACK');
            // Check if the error is the expected unique constraint violation (PostgreSQL code '23505')
            if (insertError.code === '23505') { 
                 return res.status(409).json({ message: 'You have already booked a seat on this train for this date.' });
            } else {
                // If it's some other unexpected insert error, re-throw it to be caught below
                throw insertError;
            }
        }

    } catch (error) {
        // Ensure transaction is rolled back in case of any unexpected error during the process
        // (e.g., DB connection lost, query errors other than handled ones)
        // Use `await` for rollback, but don't worry if it fails (client might already be disconnected)
        try { await client.query('ROLLBACK'); } catch (rollbackError) { console.error('Rollback failed:', rollbackError); }
        
        console.error('Booking error:', error);
         // Pass unexpected errors to central handler
        next(error);
    } finally {
        // VERY IMPORTANT: Always release the client back to the pool, whether transaction succeeded or failed.
        client.release(); 
    }
};

// Controller function to get details of a specific booking
const getBookingDetails = async (req, res, next) => {
    const { booking_id } = req.params; // Get booking_id from URL parameter
    const user_id = req.user.userId; // Extracted from jwtAuth middleware
    const user_role = req.user.role;

    if (!booking_id || isNaN(parseInt(booking_id))) {
         return res.status(400).json({ message: 'Valid booking_id parameter is required' });
    }

    try {
        const bookingResult = await db.query(
            `SELECT b.booking_id, b.user_id, u.username, b.train_id, t.train_name, 
                    t.source_station, t.destination_station, b.booking_date, b.created_at
             FROM bookings b
             JOIN users u ON b.user_id = u.user_id
             JOIN trains t ON b.train_id = t.train_id
             WHERE b.booking_id = $1`,
            [parseInt(booking_id)]
        );

        if (bookingResult.rows.length === 0) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        const booking = bookingResult.rows[0];

        // Authorization check: User can only see their own bookings unless they are admin
        if (user_role !== 'admin' && booking.user_id !== user_id) {
             return res.status(403).json({ message: 'Forbidden: You can only view your own bookings' });
        }

        res.json({ booking });

    } catch (error) {
        console.error('Error retrieving booking details:', error);
        // Pass unexpected errors to central handler
        next(error);
    }
};


module.exports = {
    bookSeat,
    getBookingDetails
}; 