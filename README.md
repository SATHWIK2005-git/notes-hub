# 📚 Notes Hub

A professional note-sharing platform where students can upload, browse, and review academic notes with a comprehensive admin panel for content management.

## 🎯 Features

### Student Portal
- 📝 **Browse Notes** - Search and filter notes by category
- ⭐ **Rate & Review** - Leave ratings and comments on notes
- 📥 **Upload Notes** - Share your study materials with the community
- 👤 **User Profile** - Manage your account and uploaded notes
- 🔐 **Secure Login** - Password-protected student accounts
- 📊 **Statistics** - Track popular notes and community insights

### Admin Dashboard
- 🛡️ **Authentication** - Secure admin login system (admin/admin123)
- 👥 **Student Management** - View all registered students
- 📋 **Notes Management** - Review, moderate, and delete notes
- ⭐ **Review Management** - Monitor student reviews and comments
- 📈 **Statistics Dashboard** - Real-time analytics
  - Total students
  - Total notes uploaded
  - Total reviews
  - Total downloads
- 🗑️ **Content Moderation** - Delete inappropriate notes
- 🔍 **Search & Filter** - Find specific content quickly

### Technical Features
- ✅ **Frontend/Backend Separation** - Professional architecture
- ✅ **RESTful API** - Clean API endpoints
- ✅ **SQLite Database** - Persistent data storage
- ✅ **Session Authentication** - Secure user sessions
- ✅ **CORS Enabled** - Cross-origin requests
- ✅ **File Upload** - Multer integration for PDF/DOC files
- ✅ **Responsive Design** - Mobile-friendly interface
- ✅ **Real-time Updates** - Instant data loading

## 📂 Project Structure

```
notes-hub/
├── frontend/
│   ├── index.html           # Landing page
│   ├── portal.html          # Student portal
│   ├── upload.html          # Note upload page
│   ├── admin.html           # Admin dashboard
│   ├── serve.js             # Frontend server
│   └── js/config.js         # API configuration
├── backend/
│   ├── server.js            # Express API server
│   ├── database.js          # Database operations
│   ├── package.json         # Dependencies
│   └── uploads/             # Uploaded files
└── ADMIN_GUIDE.md           # Admin panel documentation
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/SATHWIK2005-git/Notes-Hub.git
cd Notes-Hub
```

2. **Backend Setup**
```bash
cd notes-hub/backend
npm install
npm start
```
Backend runs on `http://localhost:3001`

3. **Frontend Setup** (in another terminal)
```bash
cd notes-hub/frontend
npm install
npm start
```
Frontend runs on `http://localhost:3000`

4. **Access the Application**
- **Landing Page**: http://localhost:3000
- **Student Portal**: http://localhost:3000/portal.html
- **Upload Notes**: http://localhost:3000/upload.html
- **Admin Panel**: http://localhost:3000/admin.html
  - Username: `admin`
  - Password: `admin123`

## 👨‍💻 Usage

### For Students

1. **Register** at the portal with your details
2. **Browse Notes** - Explore notes by category
3. **Upload Notes** - Share your study materials
4. **Rate & Review** - Give feedback on notes
5. **Manage Profile** - Update your information

### For Admins

1. **Login** at admin panel
2. **Dashboard** - View platform statistics
3. **Students Tab** - See all registered students
4. **Notes Tab** - Review and moderate notes
5. **Reviews Tab** - Check community feedback
6. **Actions** - Delete inappropriate content

## 🔐 Security

- Passwords hashed with bcrypt
- Session-based authentication
- Protected admin routes
- CORS configuration
- Input validation on frontend and backend

## 📊 Database Schema

### Tables
- **students** - Student profiles and authentication
- **notes** - Uploaded notes metadata
- **note_categories** - Note categories (Math, CS, Physics, etc.)
- **note_reviews** - Student reviews and ratings
- **admins** - Admin accounts

## 🌐 Deployment

### Deploy on Render (Free)
1. Push to GitHub
2. Go to [render.com](https://render.com)
3. Create new Web Service
4. Connect your GitHub repo
5. Set Build command: `cd notes-hub/backend && npm install`
6. Set Start command: `cd notes-hub/backend && npm start`
7. Deploy!

### Deploy on Railway
1. Go to [railway.app](https://railway.app)
2. Create new project from GitHub
3. Select your Notes-Hub repository
4. Railway auto-configures Node.js
5. Deploy!

## 📝 Default Admin Credentials

**⚠️ Change these in production!**
- Username: `admin`
- Password: `admin123`

## 🐛 Troubleshooting

### Backend not responding?
```bash
# Check if port 3001 is in use
netstat -ano | findstr :3001

# Kill the process if needed
taskkill /PID <PID> /F
```

### Frontend can't reach backend?
- Check API_BASE in `frontend/js/config.js`
- Ensure backend is running on port 3001
- Check CORS configuration

### Database errors?
- Restart the backend server
- Database auto-creates on first run

## 📖 Documentation

- [Admin Guide](notes-hub/ADMIN_GUIDE.md) - Detailed admin panel features
- [API Documentation](API_DOCUMENTATION.md) - Complete API reference

## 🤝 Contributing

Feel free to fork, modify, and improve!

## 📄 License

Open source - free to use and modify

## 👤 Author

**SATHWIK2005-git**
- GitHub: [SATHWIK2005-git](https://github.com/SATHWIK2005-git)
- Email: sathwik2k5@gmail.com

---

**Made with ❤️ for students & educators**
