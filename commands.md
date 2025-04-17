 # to create a user
 
  <!-- to create a user we use this -->
  Invoke-WebRequest -Uri http://localhost:3000/api/auth/register `
  -Method POST `
  -Body '{"username": "jatin", "password": "jatin"}' `
  -ContentType "application/json"

<!-- this command is used to login a user -->
$response = Invoke-WebRequest -Uri http://localhost:3000/api/auth/login `
  -Method POST `
  -Body '{"username": "jatin", "password": "jatin"}' `
  -ContentType "application/json"

# Parse the JSON body
$data = $response.Content | ConvertFrom-Json

# Show the token
$data.token



% <!-- this is the login token  -->
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc0NDkxMDg2NCwiZXhwIjoxNzQ0OTE0NDY0fQ.LJe8dmMbjY-zZas9flRxpoYr08Nbgw9z6YHqvU4-pmM




% <!-- this code is used to change user to admin -->
% <!-- #to promote a user  to admin -->

$headers = @{
    Authorization = "Basic " + [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes("jatinadmin:jatinadmin"))
    "Content-Type" = "application/json"
}

$body = '{
    "username": "jatin"
}'

Invoke-WebRequest -Uri http://localhost:3000/api/admin/users/role `
  -Method PUT `
  -Headers $headers `
  -Body $body





<!-- #to  add a train, only admin can do this -->

$headers = @{
    "Content-Type"  = "application/json"
    "X-API-Key"     = "jatin_secure_admin_api_key"
    "Authorization" = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc0NDkxMDg2NCwiZXhwIjoxNzQ0OTE0NDY0fQ.LJe8dmMbjY-zZas9flRxpoYr08Nbgw9z6YHqvU4-pmM"
}

$body = '{
    "train_name": "Indore Express",
    "source_station": "Indore",
    "destination_station": "Bhopal",
    "total_seats": 100
}'

Invoke-WebRequest -Uri http://localhost:3000/api/admin/trains `
  -Method POST `
  -Headers $headers `
  -Body $body




<!-- # to get a train -->

Invoke-WebRequest -Uri "http://localhost:3000/api/trains/availability?source=Chennai%20Central&destination=Bengaluru%20City" `
  -Method GET


Invoke-WebRequest -Uri "http://localhost:3000/api/trains/availability?source=Indore&destination=Bhopal" `
  -Method GET




<!-- # to post a booking  -->

$headers = @{
    "Content-Type"  = "application/json"
    "Authorization" = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc0NDkxMDg2NCwiZXhwIjoxNzQ0OTE0NDY0fQ.LJe8dmMbjY-zZas9flRxpoYr08Nbgw9z6YHqvU4-pmM"
}

$body = '{
    "train_id": 1,
    "booking_date": "2025-04-18"
}'

Invoke-WebRequest -Uri http://localhost:3000/api/bookings `
  -Method POST `
  -Headers $headers `
  -Body $body




<!-- # to get a booking detials. -->

$headers = @{
    "Authorization" = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc0NDkxMDg2NCwiZXhwIjoxNzQ0OTE0NDY0fQ.LJe8dmMbjY-zZas9flRxpoYr08Nbgw9z6YHqvU4-pmM"
}

Invoke-WebRequest -Uri http://localhost:3000/api/bookings/1 `
  -Method GET `
  -Headers $headers

