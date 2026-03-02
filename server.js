const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const session = require('express-session');
const bcrypt = require('bcrypt');
const database = require('./database');
const emailService = require('./emailService');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from different folders
app.use('/scholarship', express.static(path.join(__dirname, 'scholarship')));
app.use('/notes-hub', express.static(path.join(__dirname, 'notes-hub')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Root route defaults to scholarship portal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'scholarship', 'index.html'));
});

// Convenient routes for main pages
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'scholarship', 'admin.html'));
});

app.get('/portal', (req, res) => {
    res.sendFile(path.join(__dirname, 'notes-hub', 'portal.html'));
});

app.get('/upload', (req, res) => {
    res.sendFile(path.join(__dirname, 'notes-hub', 'upload.html'));
});

// Session middleware for admin authentication
app.use(session({
    secret: 'your-secret-key-change-this-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: false, // Set to true if using HTTPS
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
const notesUploadsDir = path.join(__dirname, 'uploads/notes');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}
if (!fs.existsSync(notesUploadsDir)) {
    fs.mkdirSync(notesUploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(new Error('Only PDF files are allowed!'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

// Authentication middleware
const isAuthenticated = (req, res, next) => {
    if (req.session.adminLoggedIn) {
        next();
    } else {
        res.status(401).json({ error: 'Unauthorized' });
    }
};

// Routes

// Submit scholarship application
app.post('/api/submit-application', upload.fields([
    { name: 'transcript', maxCount: 1 },
    { name: 'recommendation', maxCount: 1 }
]), async (req, res) => {
    try {
        const applicationData = {
            fullName: req.body.fullName,
            email: req.body.email,
            phone: req.body.phone,
            dob: req.body.dob,
            address: req.body.address,
            institution: req.body.institution,
            program: req.body.program,
            gpa: req.body.gpa,
            year: req.body.year,
            essay: req.body.essay,
            activities: req.body.activities,
            transcriptPath: req.files['transcript'] ? req.files['transcript'][0].filename : null,
            recommendationPath: req.files['recommendation'] ? req.files['recommendation'][0].filename : null,
            status: 'pending',
            submittedAt: new Date().toISOString()
        };

        // Save to database
        const applicationId = await database.saveApplication(applicationData);

        // Send confirmation email to applicant
        await emailService.sendConfirmationEmail(
            applicationData.email,
            applicationData.fullName,
            applicationId
        );

        // Send notification email to admin
        await emailService.sendAdminNotification(
            applicationData.fullName,
            applicationId
        );

        res.json({
            success: true,
            message: 'Application submitted successfully!',
            applicationId: applicationId
        });

    } catch (error) {
        console.error('Error submitting application:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to submit application. Please try again.'
        });
    }
});

// Admin login
app.post('/api/admin/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const admin = await database.getAdmin(username);
        
        if (!admin) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const isValid = await bcrypt.compare(password, admin.password);
        
        if (isValid) {
            req.session.adminLoggedIn = true;
            req.session.adminId = admin.id;
            req.session.adminUsername = admin.username;
            res.json({ success: true, message: 'Login successful' });
        } else {
            res.status(401).json({ error: 'Invalid credentials' });
        }
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// Admin logout
app.post('/api/admin/logout', (req, res) => {
    req.session.destroy();
    res.json({ success: true, message: 'Logged out successfully' });
});

// Check admin authentication status
app.get('/api/admin/check-auth', (req, res) => {
    if (req.session.adminLoggedIn) {
        res.json({ authenticated: true, username: req.session.adminUsername });
    } else {
        res.json({ authenticated: false });
    }
});

// Get all applications (admin only)
app.get('/api/admin/applications', isAuthenticated, async (req, res) => {
    try {
        const status = req.query.status || 'all';
        const applications = await database.getApplications(status);
        res.json(applications);
    } catch (error) {
        console.error('Error fetching applications:', error);
        res.status(500).json({ error: 'Failed to fetch applications' });
    }
});

// Get single application (admin only)
app.get('/api/admin/applications/:id', isAuthenticated, async (req, res) => {
    try {
        const application = await database.getApplicationById(req.params.id);
        if (application) {
            res.json(application);
        } else {
            res.status(404).json({ error: 'Application not found' });
        }
    } catch (error) {
        console.error('Error fetching application:', error);
        res.status(500).json({ error: 'Failed to fetch application' });
    }
});

// Update application status (admin only)
app.put('/api/admin/applications/:id/status', isAuthenticated, async (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ['pending', 'approved', 'rejected', 'under_review'];
        
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        await database.updateApplicationStatus(req.params.id, status);
        
        // Get application details to send email
        const application = await database.getApplicationById(req.params.id);
        
        // Send status update email to applicant
        if (status === 'approved' || status === 'rejected') {
            await emailService.sendStatusUpdateEmail(
                application.email,
                application.fullName,
                status,
                req.params.id
            );
        }

        res.json({ success: true, message: 'Status updated successfully' });
    } catch (error) {
        console.error('Error updating status:', error);
        res.status(500).json({ error: 'Failed to update status' });
    }
});

// Delete application (admin only)
app.delete('/api/admin/applications/:id', isAuthenticated, async (req, res) => {
    try {
        // Get application to delete associated files
        const application = await database.getApplicationById(req.params.id);
        
        if (application) {
            // Delete files
            if (application.transcriptPath) {
                const transcriptPath = path.join(uploadsDir, application.transcriptPath);
                if (fs.existsSync(transcriptPath)) {
                    fs.unlinkSync(transcriptPath);
                }
            }
            if (application.recommendationPath) {
                const recommendationPath = path.join(uploadsDir, application.recommendationPath);
                if (fs.existsSync(recommendationPath)) {
                    fs.unlinkSync(recommendationPath);
                }
            }
        }

        await database.deleteApplication(req.params.id);
        res.json({ success: true, message: 'Application deleted successfully' });
    } catch (error) {
        console.error('Error deleting application:', error);
        res.status(500).json({ error: 'Failed to delete application' });
    }
});

// Download uploaded file (admin only)
app.get('/api/admin/download/:filename', isAuthenticated, (req, res) => {
    const filePath = path.join(uploadsDir, req.params.filename);
    
    if (fs.existsSync(filePath)) {
        res.download(filePath);
    } else {
        res.status(404).json({ error: 'File not found' });
    }
});

// Get statistics (admin only)
app.get('/api/admin/statistics', isAuthenticated, async (req, res) => {
    try {
        const [stats, students, notes, reviews] = await Promise.all([
            database.getStatistics(),
            database.getAllStudents(),
            database.getAllNotesWithStats(),
            database.getAllReviewsWithDetails()
        ]);

        res.json({
            ...stats,
            totalStudents: students.length,
            totalNotes: notes.length,
            totalReviews: reviews.length
        });
    } catch (error) {
        console.error('Error fetching statistics:', error);
        res.status(500).json({ error: 'Failed to fetch statistics' });
    }
});

// Get all registered students (admin only)
app.get('/api/admin/students', isAuthenticated, async (req, res) => {
    try {
        const students = await database.getAllStudents();
        res.json(students);
    } catch (error) {
        console.error('Error fetching students:', error);
        res.status(500).json({ error: 'Failed to fetch students' });
    }
});

// Get all uploaded notes (admin only)
app.get('/api/admin/notes', isAuthenticated, async (req, res) => {
    try {
        const notes = await database.getAllNotesWithStats();
        res.json(notes);
    } catch (error) {
        console.error('Error fetching notes:', error);
        res.status(500).json({ error: 'Failed to fetch notes' });
    }
});

// Get all note reviews (admin only)
app.get('/api/admin/reviews', isAuthenticated, async (req, res) => {
    try {
        const reviews = await database.getAllReviewsWithDetails();
        res.json(reviews);
    } catch (error) {
        console.error('Error fetching reviews:', error);
        res.status(500).json({ error: 'Failed to fetch reviews' });
    }
});

// Delete uploaded note and its file (admin only)
app.delete('/api/admin/notes/:id', isAuthenticated, async (req, res) => {
    try {
        const note = await database.getNoteById(req.params.id);
        if (!note) {
            return res.status(404).json({ error: 'Note not found' });
        }

        const noteFilePath = path.join(notesUploadsDir, note.filePath);
        if (fs.existsSync(noteFilePath)) {
            fs.unlinkSync(noteFilePath);
        }

        await database.deleteNoteById(req.params.id);
        res.json({ success: true, message: 'Note deleted successfully' });
    } catch (error) {
        console.error('Error deleting note:', error);
        res.status(500).json({ error: 'Failed to delete note' });
    }
});

// Get all applications (public - for debugging)
app.get('/api/applications', async (req, res) => {
    try {
        const applications = await database.getApplications('all');
        res.json({
            success: true,
            count: applications.length,
            applications: applications
        });
    } catch (error) {
        console.error('Error fetching applications:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch applications'
        });
    }
});

// Get single application by ID (public - for debugging)
app.get('/api/applications/:id', async (req, res) => {
    try {
        const application = await database.getApplicationById(req.params.id);
        if (application) {
            res.json({
                success: true,
                application: application
            });
        } else {
            res.status(404).json({
                success: false,
                error: 'Application not found'
            });
        }
    } catch (error) {
        console.error('Error fetching application:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch application'
        });
    }
});

// ==================== STUDENT PORTAL ROUTES ====================

// Student registration
app.post('/api/student/register', async (req, res) => {
    const { fullName, email, password, confirmPassword, phone, institution, program, year, bio } = req.body;

    try {
        // Validate inputs
        if (!fullName || !email || !password || !confirmPassword) {
            return res.status(400).json({ success: false, error: 'Please fill in all required fields' });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({ success: false, error: 'Passwords do not match' });
        }

        if (password.length < 6) {
            return res.status(400).json({ success: false, error: 'Password must be at least 6 characters' });
        }

        // Check if student already exists
        const existingStudent = await database.getStudentByEmail(email);
        if (existingStudent) {
            return res.status(400).json({ success: false, error: 'Email already registered' });
        }

        // Register student
        const studentId = await database.registerStudent({
            fullName, email, password, phone, institution, program, year, bio
        });

        // Create session
        req.session.studentLoggedIn = true;
        req.session.studentId = studentId;
        req.session.studentEmail = email;
        req.session.studentName = fullName;

        res.json({
            success: true,
            message: 'Registration successful!',
            studentId: studentId
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Student login
app.post('/api/student/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        if (!email || !password) {
            return res.status(400).json({ success: false, error: 'Email and password required' });
        }

        const student = await database.getStudentByEmail(email);
        if (!student) {
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }

        const isValidPassword = await bcrypt.compare(password, student.password);
        if (!isValidPassword) {
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }

        req.session.studentLoggedIn = true;
        req.session.studentId = student.id;
        req.session.studentEmail = student.email;
        req.session.studentName = student.fullName;

        res.json({
            success: true,
            message: 'Login successful',
            studentId: student.id,
            fullName: student.fullName
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, error: 'Login failed' });
    }
});

// Student logout
app.post('/api/student/logout', (req, res) => {
    req.session.destroy();
    res.json({ success: true, message: 'Logged out successfully' });
});

// Check student auth
app.get('/api/student/check-auth', (req, res) => {
    if (req.session.studentLoggedIn) {
        res.json({
            authenticated: true,
            studentId: req.session.studentId,
            fullName: req.session.studentName,
            email: req.session.studentEmail
        });
    } else {
        res.json({ authenticated: false });
    }
});

// Get student profile
app.get('/api/student/profile/:id', async (req, res) => {
    try {
        const student = await database.getStudentById(req.params.id);
        if (student) {
            delete student.password;
            res.json({ success: true, student: student });
        } else {
            res.status(404).json({ success: false, error: 'Student not found' });
        }
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to fetch profile' });
    }
});

// ==================== NOTE UPLOAD & MANAGEMENT ====================

// Configure multer for note uploads
const notesStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        if (!fs.existsSync(notesUploadsDir)) {
            fs.mkdirSync(notesUploadsDir, { recursive: true });
        }
        cb(null, notesUploadsDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'note-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const notesFileFilter = (req, file, cb) => {
    const allowedMimes = ['application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only PDF, TXT, DOC, DOCX files allowed'), false);
    }
};

const notesUpload = multer({
    storage: notesStorage,
    fileFilter: notesFileFilter,
    limits: { fileSize: 20 * 1024 * 1024 }
});

// Upload note
app.post('/api/notes/upload', notesUpload.single('noteFile'), async (req, res) => {
    try {
        if (!req.session.studentLoggedIn) {
            return res.status(401).json({ success: false, error: 'Please login first' });
        }

        if (!req.file) {
            return res.status(400).json({ success: false, error: 'File is required' });
        }

        const { title, description, categoryId } = req.body;
        if (!title || !categoryId) {
            fs.unlinkSync(req.file.path);
            return res.status(400).json({ success: false, error: 'Title and category are required' });
        }

        const noteId = await database.uploadNote({
            title,
            description,
            categoryId: parseInt(categoryId),
            studentId: req.session.studentId,
            filePath: req.file.filename,
            fileSize: req.file.size,
            fileType: req.file.mimetype
        });

        res.json({
            success: true,
            message: 'Note uploaded successfully',
            noteId: noteId
        });

    } catch (error) {
        if (req.file) fs.unlinkSync(req.file.path);
        console.error('Upload error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get all categories
app.get('/api/notes/categories', async (req, res) => {
    try {
        const categories = await database.getAllCategories();
        res.json({ success: true, categories: categories });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to fetch categories' });
    }
});

// Get notes by category
app.get('/api/notes/category/:categoryId', async (req, res) => {
    try {
        const notes = await database.getNotesByCategory(req.params.categoryId);
        res.json({ success: true, notes: notes });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to fetch notes' });
    }
});

// Search notes
app.get('/api/notes/search', async (req, res) => {
    try {
        const query = req.query.q || '';
        if (query.length < 2) {
            return res.json({ success: true, notes: [] });
        }
        const notes = await database.searchNotes(query);
        res.json({ success: true, notes: notes });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Search failed' });
    }
});

// Get note details
app.get('/api/notes/:id', async (req, res) => {
    try {
        const note = await database.getNoteById(req.params.id);
        if (note) {
            const reviews = await database.getReviewsByNote(req.params.id);
            res.json({ success: true, note: note, reviews: reviews });
        } else {
            res.status(404).json({ success: false, error: 'Note not found' });
        }
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to fetch note' });
    }
});

// Get student's notes
app.get('/api/student/:studentId/notes', async (req, res) => {
    try {
        const notes = await database.getStudentNotes(req.params.studentId);
        res.json({ success: true, notes: notes });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to fetch notes' });
    }
});

// Download note
app.get('/api/notes/:id/download', async (req, res) => {
    try {
        const note = await database.getNoteById(req.params.id);
        if (!note) {
            return res.status(404).json({ success: false, error: 'Note not found' });
        }

        const filePath = path.join(__dirname, 'uploads/notes', note.filePath);
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ success: false, error: 'File not found' });
        }

        // Update download count
        await database.updateNoteDownloads(req.params.id);

        res.download(filePath, note.title + path.extname(note.filePath));
    } catch (error) {
        res.status(500).json({ success: false, error: 'Download failed' });
    }
});

// Add review/rating
app.post('/api/notes/:id/review', async (req, res) => {
    try {
        if (!req.session.studentLoggedIn) {
            return res.status(401).json({ success: false, error: 'Please login first' });
        }

        const { rating, comment } = req.body;
        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ success: false, error: 'Rating must be between 1 and 5' });
        }

        const reviewId = await database.addReview({
            noteId: req.params.id,
            studentId: req.session.studentId,
            rating: parseInt(rating),
            comment: comment || ''
        });

        res.json({
            success: true,
            message: 'Review added successfully',
            reviewId: reviewId
        });

    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to add review' });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: err.message || 'Something went wrong!' });
});

// Initialize database and start server
database.initialize().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
        console.log(`Admin panel: http://localhost:${PORT}/admin.html`);
    });
}).catch(err => {
    console.error('Failed to initialize database:', err);
    process.exit(1);
});
