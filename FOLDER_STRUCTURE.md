# Project Folder Structure

The project has been organized into separate folders for better management:

## Directory Structure

```
website_details/
├── scholarship/          # Scholarship Portal
│   ├── index.html       # Main scholarship application page
│   ├── script.js        # Scholarship portal logic
│   ├── style.css        # Scholarship portal styles
│   ├── admin.html       # Admin dashboard
│   ├── admin-script.js  # Admin dashboard logic
│   └── admin-style.css  # Admin dashboard styles
│
├── notes-hub/           # Notes Sharing Platform
│   ├── portal.html      # Main notes hub portal
│   └── upload.html      # Dedicated note upload page
│
├── uploads/             # Shared file storage
│   ├── notes/          # Uploaded notes files
│   └── [scholarship documents]
│
└── [Shared Files]
    ├── server.js        # Main Express server
    ├── database.js      # Database layer
    ├── emailService.js  # Email service
    ├── package.json     # Dependencies
    └── scholarship.db   # SQLite database
```

## Access URLs

### Scholarship Portal
- **Home**: http://localhost:3000/
- **Admin Dashboard**: http://localhost:3000/admin
- **Alternative**: http://localhost:3000/scholarship/index.html

### Notes Hub
- **Portal**: http://localhost:3000/portal
- **Upload**: http://localhost:3000/upload
- **Alternative**: http://localhost:3000/notes-hub/portal.html

## Benefits of This Structure

✅ Clear separation of concerns
✅ Easy to maintain and update each portal independently
✅ Shared resources (server, database) in root directory
✅ Clean URL routing for both applications
✅ Scalable for future additions

## Note

All API routes remain unchanged. The server automatically serves files from the appropriate folders based on the URL path.
