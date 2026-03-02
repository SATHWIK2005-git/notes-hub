# Notes Hub Backend API

Professional RESTful API server for the Student Notes Hub platform.

## Features

- ✨ Student Authentication (Register/Login/Logout)
- 📤 Note Upload with File Validation
- 🔍 Search & Filter Notes by Category
- ⭐ Rating & Review System
- 📊 Download Tracking
- 🔐 Session-based Authentication
- 🗄️ SQLite Database

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: SQLite3
- **File Upload**: Multer
- **Authentication**: bcrypt + express-session
- **CORS**: Enabled for frontend integration

## Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Start server
npm start

# Development mode (with auto-reload)
npm run dev
```

## API Endpoints

### Health Check
- `GET /api/health` - Check API status

### Authentication
- `POST /api/student/register` - Register new student
- `POST /api/student/login` - Login student
- `POST /api/student/logout` - Logout student
- `GET /api/student/check-auth` - Check auth status
- `GET /api/student/profile/:id` - Get student profile

### Categories
- `GET /api/notes/categories` - Get all categories

### Notes
- `POST /api/notes/upload` - Upload note (requires auth)
- `GET /api/notes/category/:categoryId` - Get notes by category
- `GET /api/notes/search?q=query` - Search notes
- `GET /api/notes/:id` - Get note details
- `GET /api/student/:studentId/notes` - Get student's notes
- `GET /api/notes/:id/download` - Download note file

### Reviews
- `POST /api/notes/:id/review` - Add review (requires auth)

### Admin
- `GET /api/admin/students` - Get all students
- `GET /api/admin/notes` - Get all notes
- `GET /api/admin/reviews` - Get all reviews
- `DELETE /api/admin/notes/:id` - Delete note
- `GET /api/admin/statistics` - Get statistics

## Configuration

Server runs on **port 3001** by default.

Edit `.env` file to customize:
- `PORT` - Server port
- `SESSION_SECRET` - Session encryption key
- `CORS_ORIGINS` - Allowed frontend origins
- `MAX_FILE_SIZE` - Maximum upload size
- `ALLOWED_FILE_TYPES` - Allowed file extensions

## Database

Uses shared SQLite database at `../../scholarship.db`

Tables:
- `students` - Student accounts
- `note_categories` - Note categories (auto-seeded)
- `notes` - Uploaded notes
- `note_reviews` - Ratings and reviews

## File Uploads

- **Location**: `../../uploads/notes/`
- **Max Size**: 20MB
- **Allowed Types**: PDF, TXT, DOC, DOCX
- **Naming**: `note-{timestamp}-{random}.ext`

## CORS Configuration

Configured to accept requests from:
- `http://localhost:3000`
- `http://127.0.0.1:3000`

With credentials support enabled for session management.

## Development

```bash
# Test API health
curl http://localhost:3001/api/health

# Test with frontend on port 3000
npm start
```

## Production Notes

Before deploying to production:

1. Change `SESSION_SECRET` in `.env`
2. Set `NODE_ENV=production`
3. Enable HTTPS and set `cookie.secure = true`
4. Configure proper CORS origins
5. Set up proper file storage (e.g., S3)
6. Use PostgreSQL/MySQL instead of SQLite
7. Add rate limiting
8. Implement proper logging

## License

MIT
