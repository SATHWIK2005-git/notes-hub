# Notes Hub - Admin Panel Guide

## 🛡️ Professional Admin Dashboard

A comprehensive admin panel for managing the Notes Hub platform with full CRUD capabilities.

## 📍 Access

**Admin Panel URL**: http://localhost:3000/admin.html

### Default Credentials
- **Username**: `admin`
- **Password**: `admin123`

⚠️ **Important**: Change the default admin password in production!

## ✨ Features

### 1. Analytics Dashboard
View real-time statistics at a glance:
- 👥 **Total Students** - Registered user count
- 📝 **Total Notes** - Uploaded notes count
- 💬 **Total Reviews** - User reviews count
- 📥 **Total Downloads** - File download count

### 2. Student Management
**Access**: Students Tab

**Features**:
- View all registered students
- Search students by name, email, or institution
- View detailed student profiles including:
  - Contact information
  - Academic details (institution, program, year)
  - Registration date
  - Bio
- Track student activity

**Actions**:
- ✓ **View** - See full student details

### 3. Notes Management
**Access**: Notes Tab

**Features**:
- View all uploaded notes
- Search by title, category, or uploader
- Filter and sort notes
- Monitor note statistics (ratings, downloads)
- View file metadata (size, type)

**Actions**:
- ✓ **View** - See complete note details
- ✗ **Delete** - Remove note and file permanently

**Delete Process**:
1. Click "Delete" button on any note
2. Confirm deletion
3. System will:
   - Delete the physical file from server
   - Remove database record
   - Remove all associated reviews
   - Update statistics

### 4. Reviews Management
**Access**: Reviews Tab

**Features**:
- View all note reviews
- See ratings (1-5 stars)
- Read user comments
- Track review dates
- Monitor note feedback

**Actions**:
- ✓ **View** - View all review details

## 🔍 Search Functionality

Each tab has a dedicated search bar:
- **Students Tab**: Search by name, email, institution
- **Notes Tab**: Search by title, category, uploader
- **Reviews Tab**: Search by note title, reviewer, comment

Real-time filtering - results appear as you type.

## 📊 Data Tables

All data is displayed in professional, sortable tables with:
- Clean, modern design
- Hover effects for better UX
- Color-coded badges for categories
- Responsive layout
- Action buttons for each item

## 🔐 Security Features

1. **Authentication Required**: All admin routes require login
2. **Session Management**: Secure session-based authentication
3. **Protected Routes**: Backend validates admin access
4. **Logout**: Secure logout destroys session

## 🚀 Usage Workflow

### Daily Operations

1. **Login** at http://localhost:3000/admin.html
2. **Check Dashboard** - Review analytics cards
3. **Manage Content**:
   - Monitor new student registrations
   - Review and moderate uploaded notes
   - Check note reviews for quality
4. **Moderate Content**:
   - Delete inappropriate notes
   - Monitor student activity
   - Ensure content quality
5. **Logout** when done

### Content Moderation

**When to delete a note**:
- Inappropriate content
- Copyright violations
- Low-quality submissions
- Spam or abuse
- User requests

**Deletion is permanent**:
- File removed from server
- Database records deleted
- All reviews removed
- No undo available

## 🔧 Technical Details

### Backend API Endpoints

All protected with `isAdmin` middleware:

```
POST   /api/admin/login           - Admin login
POST   /api/admin/logout          - Admin logout  
GET    /api/admin/check-auth      - Check auth status
GET    /api/admin/statistics      - Get statistics
GET    /api/admin/students        - List all students
GET    /api/admin/notes           - List all notes
GET    /api/admin/reviews         - List all reviews
DELETE /api/admin/notes/:id       - Delete note
```

### Frontend Components

- **Login Page**: Secure authentication interface
- **Dashboard**: Analytics and navigation
- **Data Tables**: Students, Notes, Reviews
- **Modals**: Detailed view popups
- **Search**: Real-time filtering
- **Responsive Design**: Works on all devices

### Database Tables

Admin has access to:
- `admins` - Admin accounts
- `students` - Registered students
- `notes` - Uploaded notes
- `note_categories` - Note categories  
- `note_reviews` - Student reviews

## 💡 Pro Tips

1. **Regular Monitoring**: Check the admin panel daily
2. **Quality Control**: Review new notes regularly
3. **User Engagement**: Monitor review trends
4. **Data Backup**: Backup database regularly
5. **Security**: Change default password immediately
6. **Analytics**: Use statistics to track growth

## 🚨 Important Notes

- Delete operations are **irreversible**
- Always confirm before deleting
- Students cannot be deleted (only notes)
- Reviews are deleted with their notes
- File deletions are permanent

## 🔄 Future Enhancements

Planned features:
- Edit note metadata
- Send notifications to students
- Export data to CSV
- Advanced filtering options
- Bulk operations
- Student suspension
- Content flagging system
- Activity logs

## 📞 Support

If you encounter issues:
1. Check backend server is running (Port 3001)
2. Check frontend server is running (Port 3000)
3. Verify database connection
4. Check browser console for errors
5. Review server logs

## 🎯 Quick Reference

| Action | Steps |
|--------|-------|
| Login | Use admin/admin123 |
| View Stats | Check dashboard cards |
| Search Notes | Use Notes tab search |
| Delete Note | Notes tab → View → Delete |
| View Student | Students tab → View |
| Check Reviews | Reviews tab |
| Logout | Click Logout button |

---

**Admin Panel**: http://localhost:3000/admin.html  
**Backend API**: http://localhost:3001  
**Credentials**: admin / admin123

🔒 **Secure. Professional. Efficient.**
