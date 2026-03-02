# API Documentation

## Base URL
```
http://localhost:3000
```

## Public Endpoints

### Submit Application
Submit a new scholarship application with file uploads.

**Endpoint:** `POST /api/submit-application`

**Content-Type:** `multipart/form-data`

**Request Body (Form Data):**
```javascript
{
  fullName: string (required)
  email: string (required)
  phone: string (required)
  dob: date (required)
  address: string (required)
  institution: string (required)
  program: string (required)
  gpa: string (required)
  year: string (required)
  essay: string (required, min 200 chars)
  activities: string (optional)
  transcript: File (PDF, required, max 5MB)
  recommendation: File (PDF, optional, max 5MB)
  terms: boolean (required)
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Application submitted successfully!",
  "applicationId": 1
}
```

**Response (Error - 500):**
```json
{
  "success": false,
  "error": "Error message"
}
```

---

## Admin Endpoints
All admin endpoints require authentication via session cookies.

### Admin Login
Authenticate admin user and create session.

**Endpoint:** `POST /api/admin/login`

**Content-Type:** `application/json`

**Request Body:**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Login successful"
}
```

**Response (Error - 401):**
```json
{
  "error": "Invalid credentials"
}
```

---

### Admin Logout
Destroy admin session.

**Endpoint:** `POST /api/admin/logout`

**Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### Check Authentication
Check if admin is currently logged in.

**Endpoint:** `GET /api/admin/check-auth`

**Response (200):**
```json
{
  "authenticated": true,
  "username": "admin"
}
```

---

### Get All Applications
Retrieve all applications, optionally filtered by status.

**Endpoint:** `GET /api/admin/applications?status={status}`

**Query Parameters:**
- `status` (optional): all | pending | approved | rejected | under_review

**Response (200):**
```json
[
  {
    "id": 1,
    "fullName": "John Doe",
    "email": "john@example.com",
    "phone": "1234567890",
    "dob": "2000-01-01",
    "address": "123 Main St",
    "institution": "University ABC",
    "program": "Computer Science",
    "gpa": "3.8",
    "year": "3",
    "essay": "My essay text...",
    "activities": "Basketball, Volunteering",
    "transcriptPath": "transcript-12345.pdf",
    "recommendationPath": "recommendation-12345.pdf",
    "status": "pending",
    "submittedAt": "2026-03-02T10:30:00.000Z",
    "updatedAt": null
  }
]
```

---

### Get Single Application
Retrieve detailed information for a specific application.

**Endpoint:** `GET /api/admin/applications/:id`

**Response (200):**
```json
{
  "id": 1,
  "fullName": "John Doe",
  "email": "john@example.com",
  ...
}
```

**Response (404):**
```json
{
  "error": "Application not found"
}
```

---

### Update Application Status
Change the status of an application.

**Endpoint:** `PUT /api/admin/applications/:id/status`

**Content-Type:** `application/json`

**Request Body:**
```json
{
  "status": "approved"
}
```

**Valid Statuses:**
- `pending`
- `under_review`
- `approved`
- `rejected`

**Response (200):**
```json
{
  "success": true,
  "message": "Status updated successfully"
}
```

**Response (400):**
```json
{
  "error": "Invalid status"
}
```

---

### Delete Application
Permanently delete an application and its associated files.

**Endpoint:** `DELETE /api/admin/applications/:id`

**Response (200):**
```json
{
  "success": true,
  "message": "Application deleted successfully"
}
```

---

### Download File
Download an uploaded document (transcript or recommendation).

**Endpoint:** `GET /api/admin/download/:filename`

**Response (200):** File download stream

**Response (404):**
```json
{
  "error": "File not found"
}
```

---

### Get Statistics
Retrieve dashboard statistics.

**Endpoint:** `GET /api/admin/statistics`

**Response (200):**
```json
{
  "total": 10,
  "pending": 5,
  "approved": 3,
  "rejected": 1,
  "underReview": 1
}
```

---

## Error Handling

All endpoints may return the following error responses:

**401 Unauthorized:**
```json
{
  "error": "Unauthorized"
}
```

**500 Internal Server Error:**
```json
{
  "error": "Error message describing what went wrong"
}
```

---

## Authentication

Admin endpoints use session-based authentication:
1. Login via `/api/admin/login`
2. Session cookie is automatically set
3. All subsequent requests include the session cookie
4. Logout via `/api/admin/logout` to destroy session

---

## File Upload Specifications

**Accepted Format:** PDF only  
**Maximum Size:** 5 MB per file  
**Storage:** Files are stored in the `uploads/` directory  
**Naming:** Files are renamed with timestamp and random suffix  

---

## Email Notifications

### Triggered Events

1. **Application Submission:**
   - Confirmation email to applicant
   - Notification email to admin

2. **Status Change to Approved:**
   - Approval email to applicant

3. **Status Change to Rejected:**
   - Rejection email to applicant

### Email Configuration

Configure in `.env` file:
```
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
ADMIN_EMAIL=admin@scholarship.com
FROM_EMAIL=noreply@scholarship.com
```

If not configured, emails are logged to console.

---

## Rate Limiting

**Note:** For production, implement rate limiting using packages like `express-rate-limit`.

Recommended limits:
- Application submission: 3 requests per hour per IP
- Admin login: 5 attempts per 15 minutes per IP

---

## Testing with Postman/Curl

### Submit Application (curl):
```bash
curl -X POST http://localhost:3000/api/submit-application \
  -F "fullName=John Doe" \
  -F "email=john@example.com" \
  -F "phone=1234567890" \
  -F "dob=2000-01-01" \
  -F "address=123 Main St" \
  -F "institution=University ABC" \
  -F "program=Computer Science" \
  -F "gpa=3.8" \
  -F "year=3" \
  -F "essay=This is my essay text that is more than 200 characters..." \
  -F "activities=Basketball" \
  -F "transcript=@/path/to/transcript.pdf" \
  -F "terms=on"
```

### Admin Login (curl):
```bash
curl -X POST http://localhost:3000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' \
  -c cookies.txt
```

### Get Applications (curl):
```bash
curl -X GET http://localhost:3000/api/admin/applications \
  -b cookies.txt
```

---

## Database Schema

### applications table
```sql
CREATE TABLE applications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fullName TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    dob TEXT NOT NULL,
    address TEXT NOT NULL,
    institution TEXT NOT NULL,
    program TEXT NOT NULL,
    gpa TEXT NOT NULL,
    year TEXT NOT NULL,
    essay TEXT NOT NULL,
    activities TEXT,
    transcriptPath TEXT,
    recommendationPath TEXT,
    status TEXT DEFAULT 'pending',
    submittedAt TEXT NOT NULL,
    updatedAt TEXT
)
```

### admins table
```sql
CREATE TABLE admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    email TEXT,
    createdAt TEXT NOT NULL
)
```

---

## Security Considerations

1. **Password Hashing:** bcrypt with salt rounds = 10
2. **Session Secret:** Change in production via .env
3. **File Validation:** Type and size checked
4. **SQL Injection:** Parameterized queries used
5. **XSS Protection:** Output escaped in templates
6. **HTTPS:** Enable in production

---

## Support

For API issues or questions, check server console logs for detailed error messages.
