# Railway Management System API

This project implements a backend API for a simple railway management system, similar to IRCTC, built with Node.js, Express, and PostgreSQL.

## Features

*   User Registration and Login (JWT Authentication)
*   Role-Based Access Control (User, Admin)
*   Admin endpoint to add new trains (protected by API Key & Admin Role)
*   Check train availability between two stations (for the current date)
*   Book seats on a train (handles concurrency using DB transactions)
*   View specific booking details (authorized access)

## Prerequisites

*   Node.js (v14 or later recommended)
*   npm
*   PostgreSQL database server

## Setup

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd railway-management
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Set up PostgreSQL Database:**
    *   Ensure PostgreSQL is running.
    *   Create a database (e.g., `railway_db`).
    *   Create a database user with privileges on the created database.
4.  **Configure Environment Variables:**
    *   Rename `.env.example` to `.env` (or create `.env` from scratch).
    *   Update the `.env` file with your PostgreSQL connection details (`DB_USER`, `DB_HOST`, `DB_DATABASE`, `DB_PASSWORD`, `DB_PORT`).
    *   Set a strong `JWT_SECRET`.
    *   Set a secure `ADMIN_API_KEY`.
    *   Optionally, change the `PORT`.
    ```dotenv
    # .env file
    DB_USER=your_postgres_user
    DB_HOST=localhost
    DB_DATABASE=railway_db
    DB_PASSWORD=your_postgres_password
    DB_PORT=5432

    JWT_SECRET=your_very_strong_jwt_secret_key
    JWT_EXPIRES_IN=1h

    ADMIN_API_KEY=your_secure_admin_api_key

    PORT=3000
    ```
5.  **Create Database Tables:**
    *   Connect to your PostgreSQL database using `psql` or a GUI tool.
    *   Run the SQL script to create the necessary tables:
    ```bash
    psql -U your_postgres_user -d railway_db -f db_schema.sql 
    ```
    *   (Optional) Create an initial admin user directly in the database if needed (remember to hash the password appropriately, or register one via the API later and update the role manually).

## Running the Application

```bash
npm start 

```

The server will start, typically on `http://localhost:3000` (or the port specified in `.env`).

## API Endpoints

**Base URL:** `http://localhost:3000/api`

**Authentication (`/auth`)**

*   `POST /auth/register`
    *   **Body:** `{ "username": "testuser", "password": "password123" }`
    *   **Response:** `201 Created` `{ "message": "User registered successfully", "user": { ... } }`
*   `POST /auth/login`
    *   **Body:** `{ "username": "testuser", "password": "password123" }`
    *   **Response:** `200 OK` `{ "message": "Login successful", "token": "jwt_token", "userId": ..., "role": "user" }`

**Trains (`/`)** 

*   `POST /admin/trains` (Admin Only)
    *   **Headers:** `X-API-Key: <your_admin_api_key>`, `Authorization: Bearer <admin_jwt_token>`
    *   **Body:** `{ "train_name": "Express 101", "source_station": "City A", "destination_station": "City B", "total_seats": 100 }`
    *   **Response:** `201 Created` `{ "message": "Train added successfully", "train_id": ... }`
*   `GET /trains/availability` 
    *   **Query Params:** `source=City A`, `destination=City B`
    *   **Response:** `200 OK` `{ "availability": [ { "train_id": ..., "train_name": "...", "available_seats": ... } ] }`

**Bookings (`/bookings`)**

*   `POST /bookings` (Requires User Login)
    *   **Headers:** `Authorization: Bearer <user_jwt_token>`
    *   **Body:** `{ "train_id": 1, "booking_date": "YYYY-MM-DD" }` (e.g., "2024-07-27")
    *   **Response (Success):** `201 Created` `{ "message": "Seat booked successfully!", "booking_id": ... }`
    *   **Response (No Seats):** `409 Conflict` `{ "message": "No seats available..." }`
    *   **Response (Already Booked):** `409 Conflict` `{ "message": "You have already booked..." }`
*   `GET /bookings/:booking_id` (Requires User Login)
    *   **Headers:** `Authorization: Bearer <user_jwt_token>`
    *   **Params:** `booking_id` (e.g., `/bookings/5`)
    *   **Response (Success):** `200 OK` `{ "booking": { ...detailed booking info... } }`
    *   **Response (Not Found):** `404 Not Found` `{ "message": "Booking not found" }`
    *   **Response (Forbidden):** `403 Forbidden` `{ "message": "Forbidden: You can only view your own bookings" }` (if user tries to access another user's booking and is not admin)

**Admin User Management (`/admin`)**

*   `PUT /admin/users/role` (Super Admin Only - Initial Setup)
    *   **Purpose:** Promote a registered user to have the 'admin' role.
    *   **Authentication:** Uses **HTTP Basic Authentication**. Provide the `ADMIN_USERNAME` and `ADMIN_PASSWORD` from your `.env` file.
    *   **Body:** `{ "username": "username_to_promote" }`
    *   **Response (Success):** `200 OK` `{ "message": "User 'username_to_promote' role updated to 'admin' successfully", "user": { ...updated user info... } }`
    *   **Response (Not Found):** `404 Not Found` `{ "message": "User not found" }`
    *   **Response (Already Admin):** `409 Conflict` `{ "message": "User is already an admin" }`
    *   **Response (Unauthorized):** `401 Unauthorized` / `403 Forbidden` if Basic Auth credentials are missing or invalid.
    *   **Note:** This endpoint provides a way to create the first admin user without direct database access after initial setup. Use with caution.

## Notes

*   Seat availability check (`/trains/availability`) currently only checks for the *current date*.
*   The booking system assumes one booking per user per train per day.
*   Error handling is basic; more specific error handling could be added.
*   Consider adding input validation middleware (e.g., using `express-validator`) for more robust input checking. 