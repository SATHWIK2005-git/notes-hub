const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const session = require('express-session');
const bcrypt = require('bcrypt');
const database = require('./database');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session middleware for student authentication
app.use(session({
    secret: 'notes-hub-secret-key-change-this-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // Set to true if using HTTPS
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        sameSite: 'lax'
    }
}));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../../uploads/notes');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../../uploads')));

// Root route
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Notes Hub API Server',
        version: '1.0.0',
        endpoints: {
            health: '/api/health',
            auth: '/api/student/*',
            notes: '/api/notes/*',
            admin: '/api/admin/*'
        }
    });
});

// Configure multer for note uploads
const notesStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
        }
        cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'note-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const notesFileFilter = (req, file, cb) => {
    const allowedMimes = [
        'application/pdf',
        'text/plain',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only PDF, TXT, DOC, DOCX files allowed'), false);
    }
};

const notesUpload = multer({
    storage: notesStorage,
    fileFilter: notesFileFilter,
    limits: { fileSize: 20 * 1024 * 1024 } // 20MB
});

// Authentication middleware
const isAuthenticated = (req, res, next) => {
    if (req.session.studentLoggedIn) {
        next();
    } else {
        res.status(401).json({ success: false, error: 'Unauthorized' });
    }
};

// Admin authentication middleware
const isAdmin = (req, res, next) => {
    if (req.session.adminLoggedIn) {
        next();
    } else {
        res.status(401).json({ success: false, error: 'Unauthorized - Admin access required' });
    }
};

// ==================== HEALTH CHECK ====================

app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Notes Hub API is running',
        timestamp: new Date().toISOString()
    });
});

// ==================== ADMIN AUTHENTICATION ====================

// Admin login
app.post('/api/admin/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const admin = await database.getAdmin(username);
        
        if (!admin) {
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }

        const isValid = await bcrypt.compare(password, admin.password);
        
        if (isValid) {
            req.session.adminLoggedIn = true;
            req.session.adminId = admin.id;
            req.session.adminUsername = admin.username;
            res.json({ success: true, message: 'Login successful' });
        } else {
            res.status(401).json({ success: false, error: 'Invalid credentials' });
        }
    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({ success: false, error: 'Login failed' });
    }
});

// Admin logout
app.post('/api/admin/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ success: false, error: 'Logout failed' });
        }
        res.json({ success: true, message: 'Logged out successfully' });
    });
});

// Check admin authentication status
app.get('/api/admin/check-auth', (req, res) => {
    if (req.session.adminLoggedIn) {
        res.json({ 
            authenticated: true, 
            username: req.session.adminUsername 
        });
    } else {
        res.json({ authenticated: false });
    }
});

// ==================== STUDENT AUTHENTICATION ====================

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
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ success: false, error: 'Logout failed' });
        }
        res.json({ success: true, message: 'Logged out successfully' });
    });
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

// ==================== CATEGORIES ====================

// Get all categories
app.get('/api/notes/categories', async (req, res) => {
    try {
        const categories = await database.getAllCategories();
        res.json({ success: true, categories: categories });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to fetch categories' });
    }
});

// ==================== NOTES ====================

// Upload note
app.post('/api/notes/upload', isAuthenticated, notesUpload.single('noteFile'), async (req, res) => {
    try {
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
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        console.error('Upload error:', error);
        res.status(500).json({ success: false, error: error.message });
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

        const filePath = path.join(uploadsDir, note.filePath);
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ success: false, error: 'File not found' });
        }

        // Update download count
        await database.updateNoteDownloads(req.params.id);

        res.download(filePath, note.title + path.extname(note.filePath));
    } catch (error) {
        console.error('Download error:', error);
        res.status(500).json({ success: false, error: 'Download failed' });
    }
});

// ==================== REVIEWS ====================

// Add review/rating
app.post('/api/notes/:id/review', isAuthenticated, async (req, res) => {
    try {
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
        console.error('Review error:', error);
        res.status(500).json({ success: false, error: 'Failed to add review' });
    }
});

// ==================== ADMIN ROUTES ====================

// Get all students
app.get('/api/admin/students', isAdmin, async (req, res) => {
    try {
        const students = await database.getAllStudents();
        res.json({ success: true, students: students });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to fetch students' });
    }
});

// Get all notes
app.get('/api/admin/notes', isAdmin, async (req, res) => {
    try {
        const notes = await database.getAllNotesWithStats();
        res.json({ success: true, notes: notes });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to fetch notes' });
    }
});

// Get all reviews
app.get('/api/admin/reviews', isAdmin, async (req, res) => {
    try {
        const reviews = await database.getAllReviewsWithDetails();
        res.json({ success: true, reviews: reviews });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to fetch reviews' });
    }
});

// Delete note
app.delete('/api/admin/notes/:id', isAdmin, async (req, res) => {
    try {
        const note = await database.getNoteById(req.params.id);
        if (!note) {
            return res.status(404).json({ success: false, error: 'Note not found' });
        }

        const noteFilePath = path.join(uploadsDir, note.filePath);
        if (fs.existsSync(noteFilePath)) {
            fs.unlinkSync(noteFilePath);
        }

        await database.deleteNoteById(req.params.id);
        res.json({ success: true, message: 'Note deleted successfully' });
    } catch (error) {
        console.error('Error deleting note:', error);
        res.status(500).json({ success: false, error: 'Failed to delete note' });
    }
});

// Get statistics
app.get('/api/admin/statistics', isAdmin, async (req, res) => {
    try {
        const stats = await database.getStatistics();
        res.json(stats);
    } catch (error) {
        console.error('Statistics error:', error);
        res.status(500).json({ error: 'Failed to fetch statistics' });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ success: false, error: err.message || 'Something went wrong!' });
});

// Export app for use as middleware
module.exports = app;

// Only start server if run directly (not imported)
if (require.main === module) {
    database.initialize().then(() => {
        app.listen(PORT, () => {
            console.log(`\n✓ Notes Hub API Server running on http://localhost:${PORT}`);
            console.log(`✓ API Health: http://localhost:${PORT}/api/health`);
            console.log(`✓ Ready to accept requests\n`);
        });
    }).catch(err => {
        console.error('Failed to initialize database:', err);
        process.exit(1);
    });
}
