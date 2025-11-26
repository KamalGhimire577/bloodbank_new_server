# Admin Dashboard API Documentation

Base URL: `http://localhost:PORT/api/admin/dashboard`

## Authentication
All endpoints require:
- Valid JWT token in Authorization header: `Bearer <token>`
- Admin role permissions

## Endpoints

### 1. Get All Users
**GET** `/users`

Fetches all users with role 'user'.

**Response:**
```json
{
  "message": "All users fetched successfully",
  "data": [
    {
      "id": "uuid",
      "userName": "string",
      "email": "string",
      "phoneNumber": "string",
      "role": "user",
      "createdAt": "timestamp",
      "updatedAt": "timestamp"
    }
  ]
}
```

### 2. Get All Donors
**GET** `/donors`

Fetches all donors with their user information.

**Response:**
```json
{
  "message": "All donors fetched successfully",
  "data": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "province": "string",
      "district": "string", 
      "city": "string",
      "bloodgroup": "string",
      "dob": "date",
      "last_donation_date": "date",
      "next_eligible_date": "date",
      "userName": "string",
      "email": "string",
      "phoneNumber": "string",
      "role": "donor"
    }
  ]
}
```

### 3. Get All Completed Donations
**GET** `/donations`

Fetches all completed blood donations.

**Response:**
```json
{
  "message": "Completed donations fetched successfully",
  "data": [
    {
      "id": "uuid",
      "completed_date": "timestamp",
      "urgent": boolean,
      "status": "completed",
      "requester_name": "string",
      "requester_phone": "string",
      "requester_address": "string",
      "blood_group": "string",
      "requesterUserName": "string",
      "requesterEmail": "string",
      "donorName": "string",
      "donorEmail": "string",
      "donorPhone": "string",
      "donorBloodGroup": "string"
    }
  ]
}
```

### 4. Get All Blood Requests
**GET** `/blood-requests`

Fetches all pending/active blood requests.

**Response:**
```json
{
  "message": "Blood requests fetched successfully",
  "data": [
    {
      "id": "uuid",
      "request_date": "timestamp",
      "urgent": boolean,
      "status": "pending",
      "requester_name": "string",
      "requester_phone": "string", 
      "requester_address": "string",
      "blood_group": "string",
      "requesterUserName": "string",
      "requesterEmail": "string",
      "donorName": "string|null",
      "donorEmail": "string|null",
      "donorPhone": "string|null",
      "donorBloodGroup": "string|null"
    }
  ]
}
```

### 5. Update Blood Request Status
**PUT** `/blood-requests/:id`

Updates the status of a blood request.

**Parameters:**
- `id` (path): Blood request ID

**Request Body:**
```json
{
  "status": "pending|accepted|completed|cancelled"
}
```

**Response:**
```json
{
  "message": "Blood request {id} status updated to {status}"
}
```

### 6. Delete User
**DELETE** `/delete-user/:id`

Deletes a user by ID.

**Parameters:**
- `id` (path): User ID to delete

**Response:**
```json
{
  "message": "User {id} deleted successfully"
}
```

### 7. Delete Donor
**DELETE** `/delete-donor/:id`

Deletes a donor by ID.

**Parameters:**
- `id` (path): Donor ID to delete

**Response:**
```json
{
  "message": "Donor {id} deleted successfully"
}
```

### 8. Delete Blood Requests
**DELETE** `/delete-blood-requests`

Deletes blood requests by user ID or donor ID.

**Request Body:**
```json
{
  "userId": "uuid", // optional
  "donorId": "uuid" // optional
}
```
*Note: Provide either userId OR donorId*

**Response:**
```json
{
  "message": "Blood requests deleted successfully"
}
```

## Error Responses

All endpoints may return these error responses:

**400 Bad Request:**
```json
{
  "message": "Error description"
}
```

**401 Unauthorized:**
```json
{
  "message": "Authentication required"
}
```

**403 Forbidden:**
```json
{
  "message": "Admin access required"
}
```

**500 Internal Server Error:**
```json
{
  "message": "Failed to perform operation",
  "error": "Error details"
}
```

## Frontend Integration Examples

### Fetch All Users
```javascript
const response = await fetch('/api/admin/dashboard/users', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
const data = await response.json();
```

### Update Blood Request Status
```javascript
const response = await fetch(`/api/admin/dashboard/blood-requests/${requestId}`, {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ status: 'completed' })
});
```

### Delete User
```javascript
const response = await fetch(`/api/admin/dashboard/delete-user/${userId}`, {
  method: 'DELETE',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```