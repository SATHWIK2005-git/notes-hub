# 📚 Student Notes Hub - Complete System

## 🚀 Quick Start

Your **professional student notes sharing platform** is now ready! Access it at:

```
http://localhost:3000/portal.html
```

---

## 📋 Features Included

### ✅ Student Management
- **Registration System** - Students can create accounts
- **Secure Login** - Password hashing with bcrypt
- **Profile Management** - View and manage student profile
- **Session Management** - Secure session handling

### 📤 Note Upload System
- **File Upload** - Upload PDF, DOC, DOCX, TXT files (max 20MB)
- **Categorization** - Organize notes by subject/category
- **Metadata** - Track upload date, uploader, file details
- **10+ Built-in Categories** - Engineering, Science, Math, Programming, etc.

### 🔍 Discovery & Search
- **Global Search** - Search notes by title, description, or category
- **Category Browsing** - Filter notes by subject
- **Advanced Filtering** - Multiple filter options
- **Note Statistics** - Track downloads, ratings, reviews

### ⭐ Rating & Review System
- **5-Star Ratings** - Rate quality of notes
- **Comments** - Leave detailed feedback
- **Review History** - See all reviews on a note
- **Dynamic Ratings** - Average ratings update automatically

### 📊 Statistics & Tracking
- **Download Counter** - Track note popularity
- **Rating System** - Community ratings
- **Review Count** - See how many reviews each note has
- **Student Analytics** - View your upload activity

### 🔐 Security Features
- **Password Hashing** - bcrypt encryption
- **Session Management** - Secure authentication
- **File Validation** - Only allowed file types
- **File Size Limits** - Prevent abuse

---

## 💾 Database Structure

### Tables Created
1. **students** - Student accounts and profiles
2. **notes** - Uploaded notes metadata
3. **note_categories** - Subject categories
4. **note_reviews** - Ratings and comments

---

## 🛣️ API Endpoints

### Authentication Endpoints
```
POST   /api/student/register          - Register new student
POST   /api/student/login             - Login with credentials
POST   /api/student/logout            - Logout session
GET    /api/student/check-auth        - Check if logged in
GET    /api/student/profile/:id       - Get student profile
```

### Note Endpoints
```
POST   /api/notes/upload              - Upload a new note
GET    /api/notes/categories          - Get all categories
GET    /api/notes/category/:id        - Get notes by category
GET    /api/notes/search?q=query      - Search notes
GET    /api/notes/:id                 - Get note details
GET    /api/notes/:id/download        - Download note file
GET    /api/student/:id/notes         - Get student's notes
```

### Review Endpoints
```
POST   /api/notes/:id/review          - Add review/rating
GET    /api/notes/:noteId/reviews     - Get all reviews
```

---

## 📱 User Interface Sections

### 1. **Authentication**
- Login & Registration tabs
- Form validation
- Error handling

### 2. **Explore Notes**
- Browse all notes
- Search functionality
- Category filtering
- Note cards with stats

### 3. **Upload Notes**
- Form with validation
- File drag & drop
- Category selection
- Description field

### 4. **My Profile**
- Student information
- Notes I've uploaded
- Download statistics

### 5. **Note Details Modal**
- Note information
- All reviews and ratings
- Download button
- Add your own review

---

## 🎨 Pre-populated Categories

1. ⚙️ Engineering
2. 🔬 Science
3. 📐 Mathematics
4. 📚 History
5. 📖 Literature
6. 💻 Programming
7. 💼 Business
8. 🎨 Arts
9. ⚕️ Medical
10. 📄 Other

---

## 📝 Usage Examples

### For Students

**Register:**
1. Open http://localhost:3000/portal.html
2. Click "Register" tab
3. Fill in details (Name, Email, Password, Institution, etc.)
4. Click "Register"

**Upload Notes:**
1. Login to your account
2. Click "Upload Notes"
3. Fill in title and description
4. Select category
5. Upload PDF/DOC file (drag & drop supported)
6. Submit

**Browse & Download:**
1. Click "Explore Notes"
2. Search or filter by category
3. Click on any note card
4. Read reviews and ratings
5. Click "Download Note"
6. Add your own review/rating

---

## ⚙️ Admin Features

### Admin Login
```
Username: admin
Password: admin123
```

**Admin Panel Features:**
- View all applications (scholarship)
- View all student notes
- Manage note categories
- View statistics
- Approve/Reject applications

Access at: `http://localhost:3000/admin.html`

---

## 📊 Database Queries

### Get All Notes with Statistics
```sql
SELECT n.*, s.fullName as uploaderName, c.name as categoryName, c.icon
FROM notes n
JOIN students s ON n.studentId = s.id
JOIN note_categories c ON n.categoryId = c.id
ORDER BY n.downloads DESC
```

### Get Top-Rated Notes
```sql
SELECT n.*, AVG(r.rating) as avgRating, COUNT(r.id) as reviewCount
FROM notes n
LEFT JOIN note_reviews r ON n.id = r.noteId
GROUP BY n.id
ORDER BY avgRating DESC
```

### Get Student's Upload Stats
```sql
SELECT COUNT(*) as totalNotes, SUM(downloads) as totalDownloads
FROM notes
WHERE studentId = ?
```

---

## 🔧 Configuration

### File Upload Limits
- **Max File Size:** 20MB
- **Allowed Types:** PDF, DOC, DOCX, TXT
- **Upload Directory:** `/uploads/notes/`

### Rating System
- **Scale:** 1-5 stars
- **Average Rating:** Calculated from all reviews
- **Review Count:** Total number of reviews

### Session Configuration
- **Duration:** 24 hours
- **Storage:** Express Session

---

## 📂 File Structure

```
d:\website_details\
├── portal.html              // Main student portal (NEW)
├── server.js                // Express server with new routes
├── database.js              // Database with new tables & functions
├── emailService.js          // Email notifications
├── package.json             // Dependencies
├── uploads/
│   ├── notes/               // Note files (NEW)
│   └── ...
├── scholarship.db           // SQLite database (updated)
└── admin.html               // Admin panel
```

---

## 🚀 Key Functions Added

### In `database.js`:
```javascript
registerStudent()              // Student registration
uploadNote()                   // Upload new note
getNotesByCategory()           // Browse by category
searchNotes()                  // Global search
addReview()                    // Add rating/comment
getAllCategories()             // List all categories
```

### In `server.js`:
```javascript
POST /api/student/register     // New student account
POST /api/notes/upload         // File upload endpoint
GET  /api/notes/search         // Search functionality
POST /api/notes/:id/review     // Rate and review
```

---

## 💡 Usage Tips

1. **Easy to Use** - Intuitive interface for students
2. **Fast Search** - Search by title, subject, or category
3. **Community Driven** - Ratings help find quality notes
4. **Secure Downloads** - File validation and size limits
5. **Mobile Friendly** - Responsive design works on all devices

---

## 🎯 Next Steps

1. ✅ **System is Live** - Access at http://localhost:3000/portal.html
2. 📝 **Test Registration** - Create student accounts
3. 📤 **Upload Test Notes** - Try uploading files
4. 🔍 **Test Search** - Search and filter notes
5. ⭐ **Rate Notes** - Add reviews and ratings
6. 📊 **Check Admin Panel** - View statistics at http://localhost:3000/admin.html

---

## 🔗 Important URLs

| Purpose | URL |
|---------|-----|
| Student Portal | http://localhost:3000/portal.html |
| Admin Panel | http://localhost:3000/admin.html |
| Scholarship App | http://localhost:3000/index.html |
| Submissions View | http://localhost:3000/submissions.html |

---

## 📞 Support

**If you encounter issues:**
1. Check server is running: `npm start`
2. Verify database: Check `scholarship.db` exists
3. Check logs in terminal
4. Open browser console (F12) for errors

---

**System Ready! Start using the Notes Hub now! 🎉**
