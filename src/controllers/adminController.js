const db = require('../config/db');

// Controller function to update a user's role to admin
const updateUserRole = async (req, res, next) => {
    const { username } = req.body; // Get the username of the user to promote
    const newRole = 'admin'; // Hardcode the target role to admin

    if (!username) {
        return res.status(400).json({ message: 'Username of the target user is required' });
    }

    try {
        // Check if user exists
        const userResult = await db.query('SELECT user_id, role FROM users WHERE username = $1', [username]);

        if (userResult.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if user is already an admin
        if (userResult.rows[0].role === newRole) {
             return res.status(409).json({ message: 'User is already an admin' });
        }

        // Update the user's role
        const updateResult = await db.query(
            'UPDATE users SET role = $1 WHERE username = $2 RETURNING user_id, username, role',
            [newRole, username]
        );

        res.json({ 
            message: `User '${username}' role updated to '${newRole}' successfully`, 
            user: updateResult.rows[0] 
        });

    } catch (error) {
        console.error('Error updating user role:', error);
        // Pass unexpected errors to the central error handler
        next(error);
    }
};

module.exports = {
    updateUserRole,
}; 