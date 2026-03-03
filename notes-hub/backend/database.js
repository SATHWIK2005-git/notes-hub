const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const path = require('path');

// Use the shared database in the parent directory
const dbPath = process.env.VERCEL
    ? path.join('/tmp', 'scholarship.db')
    : path.join(__dirname, '../../scholarship.db');
let db;

// Initialize database
function initialize() {
    return new Promise((resolve, reject) => {
        db = new sqlite3.Database(dbPath, (err) => {
            if (err) {
                reject(err);
            } else {
                console.log('✓ Connected to SQLite database');
                createTables().then(resolve).catch(reject);
            }
        });
    });
}

// Create tables for notes hub
function createTables() {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            // Create students table
            db.run(`
                CREATE TABLE IF NOT EXISTS students (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    fullName TEXT NOT NULL,
                    email TEXT UNIQUE NOT NULL,
                    password TEXT NOT NULL,
                    phone TEXT,
                    institution TEXT,
                    program TEXT,
                    year TEXT,
                    profilePic TEXT,
                    bio TEXT,
                    createdAt TEXT NOT NULL,
                    updatedAt TEXT
                )
            `, (err) => {
                if (err) reject(err);
            });

            // Create note categories table
            db.run(`
                CREATE TABLE IF NOT EXISTS note_categories (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT UNIQUE NOT NULL,
                    description TEXT,
                    icon TEXT,
                    createdAt TEXT NOT NULL
                )
            `, (err) => {
                if (err) reject(err);
                else seedCategories();
            });

            // Create notes table
            db.run(`
                CREATE TABLE IF NOT EXISTS notes (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    title TEXT NOT NULL,
                    description TEXT,
                    categoryId INTEGER NOT NULL,
                    studentId INTEGER NOT NULL,
                    filePath TEXT NOT NULL,
                    fileSize INTEGER,
                    fileType TEXT,
                    rating REAL DEFAULT 0,
                    reviewCount INTEGER DEFAULT 0,
                    downloadCount INTEGER DEFAULT 0,
                    uploadedAt TEXT NOT NULL,
                    updatedAt TEXT,
                    FOREIGN KEY(categoryId) REFERENCES note_categories(id),
                    FOREIGN KEY(studentId) REFERENCES students(id)
                )
            `, (err) => {
                if (err) reject(err);
                else {
                    // Add downloadCount column if it doesn't exist (migration)
                    db.run(`ALTER TABLE notes ADD COLUMN downloadCount INTEGER DEFAULT 0`, (err) => {
                        // Ignore error if column already exists
                        if (err && !err.message.includes('duplicate column')) {
                            console.error('Note: Could not add downloadCount column (may already exist)');
                        }
                    });
                    // Add uploadedAt column if it doesn't exist (migration)
                    db.run(`ALTER TABLE notes ADD COLUMN uploadedAt TEXT`, (err) => {
                        // Ignore error if column already exists
                        if (err && !err.message.includes('duplicate column')) {
                            console.error('Note: Could not add uploadedAt column (may already exist)');
                        }
                    });
                    // Add createdAt column if it doesn't exist (migration)
                    db.run(`ALTER TABLE notes ADD COLUMN createdAt TEXT`, (err) => {
                        // Ignore error if column already exists
                        if (err && !err.message.includes('duplicate column')) {
                            console.error('Note: Could not add createdAt column (may already exist)');
                        }
                    });
                }
            });

            // Create note reviews table
            db.run(`
                CREATE TABLE IF NOT EXISTS note_reviews (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    noteId INTEGER NOT NULL,
                    studentId INTEGER NOT NULL,
                    rating INTEGER NOT NULL,
                    comment TEXT,
                    createdAt TEXT NOT NULL,
                    FOREIGN KEY(noteId) REFERENCES notes(id) ON DELETE CASCADE,
                    FOREIGN KEY(studentId) REFERENCES students(id) ON DELETE CASCADE
                )
            `, (err) => {
                if (err) reject(err);
                else {
                    console.log('✓ All tables created/verified');
                    createDefaultAdmin()
                        .then(() => resolve())
                        .catch(reject);
                }
            });
        });
    });
}

// Seed default categories
function seedCategories() {
    const categories = [
        { name: 'Mathematics', description: 'Algebra, Calculus, Statistics', icon: '📐' },
        { name: 'Computer Science', description: 'Programming, Algorithms, Data Structures', icon: '💻' },
        { name: 'Physics', description: 'Mechanics, Thermodynamics, Quantum', icon: '⚛️' },
        { name: 'Chemistry', description: 'Organic, Inorganic, Physical', icon: '🧪' },
        { name: 'Biology', description: 'Genetics, Ecology, Anatomy', icon: '🧬' },
        { name: 'Engineering', description: 'Civil, Mechanical, Electrical', icon: '⚙️' },
        { name: 'Business', description: 'Management, Finance, Marketing', icon: '💼' },
        { name: 'Literature', description: 'Poetry, Novel, Drama', icon: '📚' },
        { name: 'History', description: 'World History, Modern History', icon: '🏛️' },
        { name: 'Languages', description: 'English, Spanish, French', icon: '🌍' }
    ];

    const checkQuery = `SELECT COUNT(*) as count FROM note_categories`;
    db.get(checkQuery, (err, row) => {
        if (!err && row.count === 0) {
            const stmt = db.prepare(`INSERT INTO note_categories (name, description, icon, createdAt) VALUES (?, ?, ?, ?)`);
            categories.forEach(cat => {
                stmt.run(cat.name, cat.description, cat.icon, new Date().toISOString());
            });
            stmt.finalize();
            console.log('✓ Default categories seeded');
        }
    });
}

// ==================== STUDENT FUNCTIONS ====================

// Register student
function registerStudent(data) {
    return new Promise(async (resolve, reject) => {
        try {
            const hashedPassword = await bcrypt.hash(data.password, 10);
            const createdAt = new Date().toISOString();

            const sql = `INSERT INTO students (fullName, email, password, phone, institution, program, year, bio, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
            
            db.run(sql, [data.fullName, data.email, hashedPassword, data.phone || '', data.institution || '', data.program || '', data.year || '', data.bio || '', createdAt], function(err) {
                if (err) reject(err);
                else resolve(this.lastID);
            });
        } catch (error) {
            reject(error);
        }
    });
}

// Get student by email
function getStudentByEmail(email) {
    return new Promise((resolve, reject) => {
        db.get(`SELECT * FROM students WHERE email = ?`, [email], (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
}

// Get student by ID
function getStudentById(id) {
    return new Promise((resolve, reject) => {
        db.get(`SELECT * FROM students WHERE id = ?`, [id], (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
}

// Get all students
function getAllStudents() {
    return new Promise((resolve, reject) => {
        db.all(`SELECT id, fullName, email, phone, institution, program, year, createdAt FROM students ORDER BY createdAt DESC`, [], (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}

// ==================== CATEGORY FUNCTIONS ====================

// Get all categories
function getAllCategories() {
    return new Promise((resolve, reject) => {
        db.all(`SELECT * FROM note_categories ORDER BY name`, [], (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}

// ==================== NOTES FUNCTIONS ====================

// Upload note
function uploadNote(data) {
    return new Promise((resolve, reject) => {
        const createdAt = new Date().toISOString();
        // Try with createdAt first (for existing databases), fall back to uploadedAt
        const sql = `INSERT INTO notes (title, description, categoryId, studentId, filePath, fileSize, fileType, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
        
        db.run(sql, [data.title, data.description || '', data.categoryId, data.studentId, data.filePath, data.fileSize, data.fileType, createdAt], function(err) {
            if (err) {
                // If createdAt fails, try uploadedAt
                if (err.message.includes('createdAt')) {
                    const sqlAlt = `INSERT INTO notes (title, description, categoryId, studentId, filePath, fileSize, fileType, uploadedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
                    db.run(sqlAlt, [data.title, data.description || '', data.categoryId, data.studentId, data.filePath, data.fileSize, data.fileType, createdAt], function(err2) {
                        if (err2) reject(err2);
                        else resolve(this.lastID);
                    });
                } else {
                    reject(err);
                }
            }
            else resolve(this.lastID);
        });
    });
}

// Get note by ID
function getNoteById(id) {
    return new Promise((resolve, reject) => {
        const sql = `
            SELECT n.*, nc.name as categoryName, s.fullName as uploaderName
            FROM notes n
            JOIN note_categories nc ON n.categoryId = nc.id
            JOIN students s ON n.studentId = s.id
            WHERE n.id = ?
        `;
        db.get(sql, [id], (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
}

// Get notes by category
function getNotesByCategory(categoryId) {
    return new Promise((resolve, reject) => {
        const sql = `
            SELECT n.*, nc.name as categoryName, s.fullName as uploaderName
            FROM notes n
            JOIN note_categories nc ON n.categoryId = nc.id
            JOIN students s ON n.studentId = s.id
            WHERE n.categoryId = ?
            ORDER BY n.uploadedAt DESC
        `;
        db.all(sql, [categoryId], (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}

// Search notes
function searchNotes(query) {
    return new Promise((resolve, reject) => {
        const searchTerm = `%${query}%`;
        const sql = `
            SELECT n.*, nc.name as categoryName, s.fullName as uploaderName
            FROM notes n
            JOIN note_categories nc ON n.categoryId = nc.id
            JOIN students s ON n.studentId = s.id
            WHERE n.title LIKE ? OR n.description LIKE ? OR nc.name LIKE ?
            ORDER BY n.uploadedAt DESC
            LIMIT 50
        `;
        db.all(sql, [searchTerm, searchTerm, searchTerm], (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}

// Get student's notes
function getStudentNotes(studentId) {
    return new Promise((resolve, reject) => {
        const sql = `
            SELECT n.*, nc.name as categoryName
            FROM notes n
            JOIN note_categories nc ON n.categoryId = nc.id
            WHERE n.studentId = ?
            ORDER BY n.uploadedAt DESC
        `;
        db.all(sql, [studentId], (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}

// Get all notes with stats (for admin)
function getAllNotesWithStats() {
    return new Promise((resolve, reject) => {
        const sql = `
            SELECT n.*, nc.name as categoryName, s.fullName as uploaderName, s.email as uploaderEmail
            FROM notes n
            JOIN note_categories nc ON n.categoryId = nc.id
            JOIN students s ON n.studentId = s.id
            ORDER BY n.uploadedAt DESC
        `;
        db.all(sql, [], (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}

// Update note downloads
function updateNoteDownloads(noteId) {
    return new Promise((resolve, reject) => {
        db.run(`UPDATE notes SET downloadCount = downloadCount + 1 WHERE id = ?`, [noteId], (err) => {
            if (err) reject(err);
            else resolve();
        });
    });
}

// Delete note by ID
function deleteNoteById(noteId) {
    return new Promise((resolve, reject) => {
        db.run(`DELETE FROM notes WHERE id = ?`, [noteId], (err) => {
            if (err) reject(err);
            else resolve();
        });
    });
}

// ==================== REVIEW FUNCTIONS ====================

// Add review
function addReview(data) {
    return new Promise((resolve, reject) => {
        const createdAt = new Date().toISOString();
        
        db.run(`INSERT INTO note_reviews (noteId, studentId, rating, comment, createdAt) VALUES (?, ?, ?, ?, ?)`,
            [data.noteId, data.studentId, data.rating, data.comment, createdAt],
            function(err) {
                if (err) {
                    reject(err);
                } else {
                    // Update note rating and review count
                    updateNoteRating(data.noteId);
                    resolve(this.lastID);
                }
            }
        );
    });
}

// Get reviews by note
function getReviewsByNote(noteId) {
    return new Promise((resolve, reject) => {
        const sql = `
            SELECT nr.*, s.fullName as reviewerName
            FROM note_reviews nr
            JOIN students s ON nr.studentId = s.id
            WHERE nr.noteId = ?
            ORDER BY nr.createdAt DESC
        `;
        db.all(sql, [noteId], (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}

// Get all reviews with details (for admin)
function getAllReviewsWithDetails() {
    return new Promise((resolve, reject) => {
        const sql = `
            SELECT nr.*, n.title as noteTitle, s.fullName as reviewerName, s.email as reviewerEmail
            FROM note_reviews nr
            JOIN notes n ON nr.noteId = n.id
            JOIN students s ON nr.studentId = s.id
            ORDER BY nr.createdAt DESC
        `;
        db.all(sql, [], (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}

// Update note rating
function updateNoteRating(noteId) {
    const sql = `
        UPDATE notes 
        SET rating = (SELECT AVG(rating) FROM note_reviews WHERE noteId = ?),
            reviewCount = (SELECT COUNT(*) FROM note_reviews WHERE noteId = ?)
        WHERE id = ?
    `;
    db.run(sql, [noteId, noteId, noteId], (err) => {
        if (err) console.error('Error updating note rating:', err);
    });
}

// Get statistics
function getStatistics() {
    return new Promise((resolve, reject) => {
        const stats = {};
        
        // Get total students
        db.get(`SELECT COUNT(*) as count FROM students`, (err, row) => {
            if (err) return reject(err);
            stats.totalStudents = row.count;
            
            // Get total notes
            db.get(`SELECT COUNT(*) as count FROM notes`, (err, row) => {
                if (err) return reject(err);
                stats.totalNotes = row.count;
                
                // Get total reviews
                db.get(`SELECT COUNT(*) as count FROM note_reviews`, (err, row) => {
                    if (err) return reject(err);
                    stats.totalReviews = row.count;
                    
                    // Get total downloads
                    db.get(`SELECT SUM(COALESCE(downloadCount, 0)) as count FROM notes`, (err, row) => {
                        if (err) return reject(err);
                        stats.totalDownloads = row.count || 0;
                        resolve(stats);
                    });
                });
            });
        });
    });
}

// ==================== ADMIN FUNCTIONS ====================

// Create default admin (called during initialization)
async function createDefaultAdmin() {
    return new Promise(async (resolve, reject) => {
        try {
            // Check if admins table exists, create if not
            db.run(`
                CREATE TABLE IF NOT EXISTS admins (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    username TEXT UNIQUE NOT NULL,
                    password TEXT NOT NULL,
                    email TEXT,
                    createdAt TEXT NOT NULL
                )
            `, async (err) => {
                if (err) {
                    console.error('Error creating admins table:', err);
                    return reject(err);
                }

                // Check if default admin exists
                db.get('SELECT * FROM admins WHERE username = ?', ['admin'], async (err, row) => {
                    if (err) {
                        console.error('Error checking admin:', err);
                        return reject(err);
                    }

                    if (!row) {
                        // Create default admin with password 'admin123'
                        const hashedPassword = await bcrypt.hash('admin123', 10);
                        db.run(
                            'INSERT INTO admins (username, password, email, createdAt) VALUES (?, ?, ?, ?)',
                            ['admin', hashedPassword, 'admin@noteshub.com', new Date().toISOString()],
                            (err) => {
                                if (err) {
                                    console.error('Error creating admin:', err);
                                    return reject(err);
                                } else {
                                    console.log('✓ Default admin created (username: admin, password: admin123)');
                                    resolve();
                                }
                            }
                        );
                    } else {
                        resolve();
                    }
                });
            });
        } catch (error) {
            reject(error);
        }
    });
}

// Get admin by username
function getAdmin(username) {
    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM admins WHERE username = ?', [username], (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
}

module.exports = {
    initialize,
    registerStudent,
    getStudentByEmail,
    getStudentById,
    getAllStudents,
    getAllCategories,
    uploadNote,
    getNoteById,
    getNotesByCategory,
    searchNotes,
    getStudentNotes,
    getAllNotesWithStats,
    updateNoteDownloads,
    deleteNoteById,
    addReview,
    getReviewsByNote,
    getAllReviewsWithDetails,
    getStatistics,
    getAdmin
};
