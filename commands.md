 # to create a user
 
 curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "secure"}'




#to promote a user  to admin

curl -X PUT http://localhost:3000/api/admin/users/role \
-H "Content-Type: application/json" \
-u jatinadmin:jatinadmin \
-d '{
    "username": "admin"
}'
{"message":"User 'myadmin' role updated to 'admin' successfully","user":{"user_id":2,"username":"myadmin","role":"admin"}}%   



#to  add a train, only admin can do this

curl -X POST http://localhost:3000/api/admin/trains \
-H "Content-Type: application/json" \
-H "X-API-Key: jatin_secure_admin_api_key" \
-H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc0NDg3NDU1MSwiZXhwIjoxNzQ0ODc4MTUxfQ.bEfJ9i3igc8kuNqF8wa23MgDQ_1I5_Y45U0cGGcCLuw" \
-d '{
    "train_name": "Shatabdi Express",
    "source_station": "Chennai Central",
    "destination_station": "Bengaluru City",
    "total_seats": 120
}'



# to get a train

curl -X GET "http://localhost:3000/api/trains/availability?source=Chennai%20Central&destination=Bengaluru%20City"




# to post a booking 

curl -X POST http://localhost:3000/api/bookings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc0NDg3NDU1MSwiZXhwIjoxNzQ0ODc4MTUxfQ.bEfJ9i3igc8kuNqF8wa23MgDQ_1I5_Y45U0cGGcCLuw" \
  -d '{"train_id": 1, "booking_date": "2025-04-18"}'



# to get a booking detials.

curl -X GET http://localhost:3000/api/bookings/1 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc0NDg3NDU1MSwiZXhwIjoxNzQ0ODc4MTUxfQ.bEfJ9i3igc8kuNqF8wa23MgDQ_1I5_Y45U0cGGcCLuw"
