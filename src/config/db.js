require('dotenv').config(); // Load environment variables from .env file
const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

// Test the connection
pool.connect((err, client, release) => {
    if (err) {
        return console.error('Error acquiring client', err.stack);
    }
    console.log('Connected to database successfully!');
    client.release();
});

module.exports = {
    // Function to execute simple queries using a client from the pool
    query: (text, params) => pool.query(text, params),
    // Function to get a dedicated client from the pool, necessary for managing transactions
    getClient: () => pool.connect(),
}; 