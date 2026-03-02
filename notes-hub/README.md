# Notes Hub - Professional Frontend & Backend Separation

## 🎉 Project Structure

The Notes Hub has been professionally separated into independent frontend and backend systems:

```
notes-hub/
├── frontend/                # Frontend Application (Port 3000)
│   ├── index.html          # Landing page
│   ├── portal.html         # Main notes portal
│   ├── upload.html         # Upload interface
│   ├── serve.js            # Simple HTTP server
│   ├── package.json        # Frontend dependencies
│   ├── js/
│   │   └── config.js       # API configuration
│   └── css/                # (Future: Extracted CSS files)
│
└── backend/                 # Backend API Server (Port 3001)
    ├── server.js           # Express API server
    ├── database.js         # Database layer
    ├── package.json        # Backend dependencies
    ├── README.md           # API documentation
    └── .env.example        # Environment configuration

```

## 🚀 Quick Start

### Backend Server (Port 3001)

```bash
cd notes-hub/backend
npm install
npm start
```

Backend API will be available at: `http://localhost:3001`

### Frontend Server (Port 3000)

```bash
cd notes-hub/frontend
npm start
```

Frontend will be available at: `http://localhost:3000`

## 📡 Architecture

### Backend (API Server)
- **Technology**: Node.js + Express.js
- **Port**: 3001
- **Database**: SQLite3 (shared at `../../scholarship.db`)
- **Features**:
  - RESTful API endpoints
  - Session-based authentication
  - File upload handling (Multer)
  - CORS enabled for frontend
  - Password hashing (bcrypt)

### Frontend (Static Files)
- **Technology**: Vanilla HTML/CSS/JavaScript
- **Port**: 3000
- **Features**:
  - Responsive UI
  - API integration via fetch
  - Config-based API endpoints
  - Multiple pages (landing, portal, upload)

## 🔌 API Integration

The frontend connects to the backend using:

```javascript
// In frontend/js/config.js
const API_BASE = 'http://localhost:3001';

// All API calls use credentials
fetch(API_BASE + '/api/endpoint', {
    credentials: 'include',  // Important for sessions
    // ... other options
});
```

## 📋 Available Endpoints

### Authentication
- `POST /api/student/register` - Register new student
- `POST /api/student/login` - Login student
- `POST /api/student/logout` - Logout student
- `GET /api/student/check-auth` - Check authentication status

### Notes
- `POST /api/notes/upload` - Upload note (auth required)
- `GET /api/notes/categories` - Get all categories
- `GET /api/notes/category/:id` - Get notes by category
- `GET /api/notes/search?q=query` - Search notes
- `GET /api/notes/:id` - Get note details
- `GET /api/notes/:id/download` - Download note file

### Reviews
- `POST /api/notes/:id/review` - Add review (auth required)

### Admin
- `GET /api/admin/students` - Get all students
- `GET /api/admin/notes` - Get all notes
- `GET /api/admin/reviews` - Get all reviews
- `DELETE /api/admin/notes/:id` - Delete note
- `GET /api/admin/statistics` - Get statistics

## 🔐 Security Features

1. **Session Management**: Express-session for authentication
2. **Password Hashing**: bcrypt for secure password storage
3. **CORS**: Controlled cross-origin access
4. **File Validation**: Size and type restrictions
5. **SQL Injection Prevention**: Parameterized queries

## 📁 File Uploads

- **Location**: `uploads/notes/` (shared directory)
- **Max Size**: 20MB
- **Allowed Types**: PDF, TXT, DOC, DOCX
- **Naming**: `note-{timestamp}-{random}.ext`

## 🎨 Frontend Pages

### 1. Landing Page (`index.html`)
- Welcome page with feature showcase
- Links to portal and upload pages

### 2. Portal (`portal.html`)
- Full-featured notes hub
- Student registration/login
- Browse, search, filter notes
- Rate and review system
- Download tracking

### 3. Upload Page (`upload.html`)
- Simplified upload interface
- Browse uploaded notes
- Quick search functionality

## 🔧 Configuration

### Backend Configuration
Edit `backend/.env`:
```env
PORT=3001
SESSION_SECRET=your-secret-key
CORS_ORIGINS=http://localhost:3000
```

### Frontend Configuration
Edit `frontend/js/config.js`:
```javascript
const API_BASE = 'http://localhost:3001';
```

## 🛠️ Development Workflow

1. **Start Backend First**:
   ```bash
   cd notes-hub/backend
   npm start
   ```

2. **Start Frontend**:
   ```bash
   cd notes-hub/frontend
   npm start
   ```

3. **Access Application**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001/api/health

## 📦 Dependencies

### Backend
- express: Web framework
- cors: Cross-origin resource sharing
- multer: File upload handling
- bcrypt: Password hashing
- express-session: Session management
- sqlite3: Database driver

### Frontend
- None (vanilla JavaScript, served by Node.js HTTP server)

## 🚢 Production Deployment

### Backend
1. Set environment variables properly
2. Use PostgreSQL/MySQL instead of SQLite
3. Enable HTTPS (set `cookie.secure = true`)
4. Use proper file storage (S3, etc.)
5. Add rate limiting
6. Set up proper logging

### Frontend
1. Use a proper web server (nginx, Apache)
2. Enable compression
3. Set up CDN for static assets
4. Minify JavaScript/CSS
5. Use environment-specific API URLs

## 🎯 Benefits of This Structure

✅ **Independent Development**: Frontend and backend teams can work separately
✅ **Scalability**: Each layer can be scaled independently
✅ **Maintainability**: Clear separation of concerns
✅ **Testing**: Easier to test API and UI separately
✅ **Deployment**: Can deploy frontend and backend on different servers
✅ **Technology Flexibility**: Easy to replace frontend (React, Vue, etc.) without changing backend

## 🔄 Data Flow

```
User Browser (Port 3000)
    ↓ HTTP Request
Frontend Server (serve.js)
    ↓ Returns HTML/JS/CSS
Browser Executes JavaScript
    ↓ API Calls (fetch with credentials)
Backend Server (Port 3001)
    ↓ Process Request
Database (SQLite)
    ↓ Return Data
Backend Response (JSON)
    ↓ Update UI
Frontend Display
```

## 📝 Notes

- Both servers must be running simultaneously
- Backend runs on port 3001, frontend on port 3000
- Sessions work via cookies (credentials: 'include' required)
- Database file is shared at `../../scholarship.db`
- Uploaded files stored at `../../uploads/notes/`

## 🤝 Contributing

1. Backend changes: Modify `backend/server.js` or `backend/database.js`
2. Frontend changes: Modify HTML files or `frontend/js/config.js`
3. API changes: Update both backend routes and frontend API calls
4. Always test both frontend and backend after changes

## 📞 Support

- Backend API Documentation: See `backend/README.md`
- Frontend is self-explanatory with inline JavaScript
- All API endpoints return JSON with `success` and `error` fields

---

**Status**: ✅ Both frontend and backend are running successfully
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- Database: Shared SQLite at root level
