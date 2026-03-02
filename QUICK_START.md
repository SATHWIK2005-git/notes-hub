# 🚀 Quick Start Guide

## Installation (First Time Only)

1. **Install Node.js** (if not already installed)
   - Download from: https://nodejs.org/
   - Choose the LTS version
   - Install with default settings

2. **Install Project Dependencies**
   Open PowerShell in this folder and run:
   ```powershell
   npm install
   ```
   Wait for installation to complete (may take 1-2 minutes)

## Running the Website

### Start the Server
```powershell
npm start
```

You should see:
```
Connected to SQLite database
Default admin user created (username: admin, password: admin123)
Email service initialized
Server is running on http://localhost:3000
Admin panel: http://localhost:3000/admin.html
```

### Access the Website

**Application Form (for students):**
- Open: http://localhost:3000/index.html
- Fill out the form
- Submit application

**Admin Panel (for reviewers):**
- Open: http://localhost:3000/admin.html
- Username: `admin`
- Password: `admin123`

## Testing the System

### Test as an Applicant
1. Go to http://localhost:3000/index.html
2. Fill out the form with test data
3. Upload a PDF file for transcript
4. Submit the form
5. You should see a success message

### Test as an Admin
1. Go to http://localhost:3000/admin.html
2. Login (admin / admin123)
3. See the new application in the dashboard
4. Click "View" to see details
5. Click "Approve" or "Reject" to change status

## Common Issues

### "npm is not recognized"
- Node.js is not installed or not in PATH
- Solution: Install/reinstall Node.js from nodejs.org

### Port 3000 already in use
- Another application is using port 3000
- Solution: Stop the other application or change PORT in .env file

### Files won't upload
- Check that `uploads` folder exists
- Server will create it automatically on first run
- Ensure you're uploading PDF files under 5MB

## Email Configuration (Optional)

By default, emails are logged to console. To send real emails:

1. Copy `.env.example` to `.env`:
   ```powershell
   Copy-Item .env.example .env
   ```

2. Edit `.env` with your email settings:
   - For Gmail: Use App Password (not regular password)
   - Enable 2FA first, then generate App Password

3. Restart the server

## Stopping the Server

Press `Ctrl + C` in the PowerShell window where the server is running.

## Next Steps

- Change admin password after first login
- Customize colors in style.css
- Configure email notifications
- Test all features thoroughly

## Need Help?

Check the full README.md for detailed documentation.
