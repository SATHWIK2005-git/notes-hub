# Scholarship Application Website

A complete, production-ready scholarship application portal with backend, database storage, email notifications, file upload handling, and a full-featured admin panel.

## 🌟 Features

### Frontend Features
✅ **Beautiful Animated Background**
- Gradient background with floating animated circles
- Smooth animations and transitions
- Fully responsive design

✅ **Comprehensive Application Form**
- Personal Information section
- Academic Information section
- Essay submission with character counter
- File uploads (Transcript & Recommendation letter)
- Extracurricular activities section
- Real-time validation

### Backend Features
✅ **RESTful API Server**
- Built with Node.js and Express
- File upload handling with Multer
- Session-based authentication
- Secure password hashing with bcrypt

✅ **Database Storage**
- SQLite database for easy setup
- Automatic schema creation
- Stores all application data
- Full CRUD operations

✅ **Email Notifications**
- Confirmation emails to applicants
- Admin notifications for new applications
- Status update emails (approval/rejection)
- Beautiful HTML email templates
- Fallback to console logging if email not configured

✅ **Admin Panel**
- Secure login system
- Dashboard with statistics
- View all applications
- Filter by status
- Approve/reject applications
- View detailed application information
- Download uploaded documents
- Delete applications
- Update application status

## 📋 Files Structure

```
website_details/
├── index.html              # Main application form
├── style.css               # Frontend styles
├── script.js               # Frontend JavaScript
├── admin.html              # Admin panel interface
├── admin-style.css         # Admin panel styles
├── admin-script.js         # Admin panel JavaScript
├── server.js               # Express server
├── database.js             # Database operations
├── emailService.js         # Email functionality
├── package.json            # NPM dependencies
├── .env.example            # Environment variables template
├── .gitignore              # Git ignore rules
└── README.md               # This file
```

## 🚀 Installation & Setup

### Prerequisites
- Node.js (version 14 or higher)
- NPM (comes with Node.js)

### Step 1: Install Node.js
If you don't have Node.js installed:
1. Download from https://nodejs.org/
2. Install the LTS version
3. Verify installation:
   ```powershell
   node --version
   npm --version
   ```

### Step 2: Install Dependencies
Open PowerShell in the project directory and run:
```powershell
npm install
```

This will install:
- express (web server)
- multer (file uploads)
- sqlite3 (database)
- bcrypt (password hashing)
- express-session (session management)
- nodemailer (email service)

### Step 3: Configure Email (Optional)
1. Copy `.env.example` to `.env`:
   ```powershell
   Copy-Item .env.example .env
   ```

2. Edit `.env` and add your email credentials:
   - For Gmail, enable 2FA and create an App Password
   - Update EMAIL_USER and EMAIL_PASSWORD

**Note:** Email is optional. If not configured, notifications will be logged to the console.

### Step 4: Start the Server
```powershell
npm start
```

The server will start on http://localhost:3000

## 📱 Usage

### For Applicants
1. Open http://localhost:3000/index.html
2. Fill out the scholarship application form
3. Upload required documents (PDF only, max 5MB)
4. Submit the application
5. Receive confirmation email

### For Administrators
1. Open http://localhost:3000/admin.html
2. Login with default credentials:
   - **Username:** admin
   - **Password:** admin123
3. View dashboard with statistics
4. Review applications
5. Approve or reject applications
6. Download submitted documents

## 🔐 Admin Panel Features

### Dashboard Statistics
- Total applications
- Pending applications
- Approved applications
- Rejected applications

### Application Management
- **View:** See detailed application information
- **Approve:** Approve applications and notify applicants
- **Reject:** Reject applications with email notification
- **Delete:** Remove applications from the database
- **Filter:** Filter by status (all, pending, approved, rejected)
- **Download:** Download uploaded PDF documents

### Status Options
- **Pending:** Initial status after submission
- **Under Review:** Application is being reviewed
- **Approved:** Application accepted
- **Rejected:** Application not accepted

## 📧 Email Notifications

### Applicant Emails
1. **Confirmation Email:** Sent immediately after submission
2. **Status Update Email:** Sent when application is approved/rejected

### Admin Emails
1. **New Application Alert:** Sent when a new application is received

### Email Templates
All emails use professional HTML templates with:
- Branded headers
- Clear information
- Action buttons
- Professional footer

## 🗄️ Database

### Schema
**Applications Table:**
- id, fullName, email, phone, dob, address
- institution, program, gpa, year
- essay, activities
- transcriptPath, recommendationPath
- status, submittedAt, updatedAt

**Admins Table:**
- id, username, password (hashed)
- email, createdAt

### Database File
- Located at: `scholarship.db`
- Created automatically on first run
- SQLite format (no installation required)

## 🔧 API Endpoints

### Public Endpoints
- `POST /api/submit-application` - Submit scholarship application

### Admin Endpoints (require authentication)
- `POST /api/admin/login` - Admin login
- `POST /api/admin/logout` - Admin logout
- `GET /api/admin/check-auth` - Check authentication status
- `GET /api/admin/applications` - Get all applications
- `GET /api/admin/applications/:id` - Get single application
- `PUT /api/admin/applications/:id/status` - Update status
- `DELETE /api/admin/applications/:id` - Delete application
- `GET /api/admin/download/:filename` - Download file
- `GET /api/admin/statistics` - Get statistics

## 🎨 Customization

### Change Colors
Edit `style.css` and `admin-style.css`:
```css
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

### Modify Form Fields
Edit `index.html` to add/remove form fields.

### Adjust Validation Rules
Edit `script.js`:
- Essay minimum length
- Age requirements
- File size limits
- GPA validation

### Email Templates
Edit `emailService.js` to customize email content and styling.

### Change Admin Credentials
After first login, you should:
1. Connect to the database
2. Update the admin password
3. Or add new admin users

## 🛡️ Security Features

- Session-based authentication
- Password hashing with bcrypt
- File type validation (PDF only)
- File size limits (5MB)
- SQL injection prevention with parameterized queries
- XSS protection with proper HTML escaping
- CSRF protection via sessions

## 📱 Browser Compatibility

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers (iOS/Android)

## 🚀 Production Deployment

### Before Deploying:
1. **Change default admin password**
2. **Set secure SESSION_SECRET in .env**
3. **Configure proper email service**
4. **Use HTTPS (set secure: true in session config)**
5. **Set up proper database backups**
6. **Consider migrating to PostgreSQL/MySQL for production**
7. **Add rate limiting for API endpoints**
8. **Set up proper logging**

### Deployment Options:
- **Heroku:** Easy deployment with free tier
- **DigitalOcean:** VPS hosting
- **AWS:** EC2 or Elastic Beanstalk
- **Vercel/Netlify:** For static files (need separate backend host)

## 🐛 Troubleshooting

### Server won't start
- Check if port 3000 is available
- Run `npm install` to ensure dependencies are installed
- Check for syntax errors in console

### Email not sending
- Verify email credentials in .env
- Check if 2FA is enabled for Gmail
- Use App Password instead of regular password
- Check console for email logs (fallback mode)

### Database errors
- Delete `scholarship.db` and restart server
- Ensure write permissions in directory

### File upload fails
- Check file is PDF format
- Ensure file size is under 5MB
- Verify `uploads/` directory exists and has write permissions

## 📝 Development

### Run in Development Mode
```powershell
npm install -g nodemon
npm run dev
```

This will auto-restart the server on file changes.

### Testing
1. Submit test applications via the form
2. Login to admin panel
3. Test all admin operations
4. Check email logs in console

## 🤝 Support

For issues or questions:
1. Check the troubleshooting section
2. Review console logs for errors
3. Ensure all dependencies are installed
4. Verify Node.js version is 14+

## 📄 License

MIT License - feel free to use and modify for your needs.

---

**Created:** March 2026  
**Version:** 1.0.0

## 🎯 Quick Start Summary

```powershell
# 1. Install dependencies
npm install

# 2. Start the server
npm start

# 3. Open in browser
# Applicant form: http://localhost:3000/index.html
# Admin panel: http://localhost:3000/admin.html
# Login: admin / admin123
```

That's it! Your scholarship portal is ready to use! 🎉
