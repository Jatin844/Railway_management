const db = require('../config/db');

// Controller function for admin to add a new train
const addTrain = async (req, res, next) => {
    const { train_name, source_station, destination_station, total_seats } = req.body;

    // Basic validation
    if (!train_name || !source_station || !destination_station || !total_seats) {
        return res.status(400).json({ message: 'Missing required fields: train_name, source_station, destination_station, total_seats' });
    }
    if (isNaN(parseInt(total_seats)) || parseInt(total_seats) <= 0) {
        return res.status(400).json({ message: 'Total seats must be a positive number' });
    }

    try {
        const newTrain = await db.query(
            'INSERT INTO trains (train_name, source_station, destination_station, total_seats) VALUES ($1, $2, $3, $4) RETURNING train_id',
            [train_name, source_station, destination_station, parseInt(total_seats)]
        );

        res.status(201).json({ 
            message: 'Train added successfully', 
            train_id: newTrain.rows[0].train_id 
        });

    } catch (error) {
        console.error('Error adding train:', error);
        // Pass unexpected errors (e.g., database connection issues) to central handler
        next(error);
    }
};

// Controller function to get seat availability between stations for the current date
const getSeatAvailability = async (req, res, next) => {
    const { source, destination } = req.query; // Get source and destination from query parameters

    if (!source || !destination) {
        return res.status(400).json({ message: 'Source and destination query parameters are required' });
    }

    // Get the current date in 'YYYY-MM-DD' format, adjusted for the server's timezone.
    // Consider timezone implications if clients and server are in different zones.
    const currentDate = new Date().toISOString().split('T')[0]; 

    try {
        // Find trains matching the source and destination
        const trainsResult = await db.query(
            'SELECT train_id, train_name, total_seats FROM trains WHERE source_station = $1 AND destination_station = $2',
            [source, destination]
        );

        if (trainsResult.rows.length === 0) {
            return res.json({ message: 'No trains found for the specified route', availability: [] });
        }

        const availability = [];
        for (const train of trainsResult.rows) {
            // For each train, count the number of bookings for the current date
            const bookingsResult = await db.query(
                'SELECT COUNT(*) AS booked_seats FROM bookings WHERE train_id = $1 AND booking_date = $2',
                [train.train_id, currentDate]
            );
            
            const bookedSeats = parseInt(bookingsResult.rows[0].booked_seats);
            const availableSeats = train.total_seats - bookedSeats;

            availability.push({
                train_id: train.train_id,
                train_name: train.train_name,
                available_seats: availableSeats > 0 ? availableSeats : 0 // Ensure available seats is not negative
            });
        }

        res.json({ availability });

    } catch (error) {
        console.error('Error getting seat availability:', error);
         // Pass unexpected errors to central handler
        next(error);
    }
};

module.exports = {
    addTrain,
    getSeatAvailability
}; 