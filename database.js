const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const path = require('path');

const dbPath = path.join(__dirname, 'scholarship.db');
let db;

// Initialize database
function initialize() {
    return new Promise((resolve, reject) => {
        db = new sqlite3.Database(dbPath, (err) => {
            if (err) {
                reject(err);
            } else {
                console.log('Connected to SQLite database');
                createTables().then(resolve).catch(reject);
            }
        });
    });
}

// Create tables
function createTables() {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            // Applications table
            db.run(`
                CREATE TABLE IF NOT EXISTS applications (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    fullName TEXT NOT NULL,
                    email TEXT NOT NULL,
                    phone TEXT NOT NULL,
                    dob TEXT NOT NULL,
                    address TEXT NOT NULL,
                    institution TEXT NOT NULL,
                    program TEXT NOT NULL,
                    gpa TEXT NOT NULL,
                    year TEXT NOT NULL,
                    essay TEXT NOT NULL,
                    activities TEXT,
                    transcriptPath TEXT,
                    recommendationPath TEXT,
                    status TEXT DEFAULT 'pending',
                    submittedAt TEXT NOT NULL,
                    updatedAt TEXT
                )
            `, (err) => {
                if (err) reject(err);
            });

            // Admin users table
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
                    reject(err);
                } else {
                    await createDefaultAdmin();
                    
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
                            downloads INTEGER DEFAULT 0,
                            rating REAL DEFAULT 0,
                            reviewCount INTEGER DEFAULT 0,
                            isPublished INTEGER DEFAULT 1,
                            createdAt TEXT NOT NULL,
                            updatedAt TEXT,
                            FOREIGN KEY(categoryId) REFERENCES note_categories(id),
                            FOREIGN KEY(studentId) REFERENCES students(id)
                        )
                    `, (err) => {
                        if (err) reject(err);
                    });

                    // Create ratings and comments table
                    db.run(`
                        CREATE TABLE IF NOT EXISTS note_reviews (
                            id INTEGER PRIMARY KEY AUTOINCREMENT,
                            noteId INTEGER NOT NULL,
                            studentId INTEGER NOT NULL,
                            rating INTEGER,
                            comment TEXT,
                            createdAt TEXT NOT NULL,
                            updatedAt TEXT,
                            FOREIGN KEY(noteId) REFERENCES notes(id) ON DELETE CASCADE,
                            FOREIGN KEY(studentId) REFERENCES students(id) ON DELETE CASCADE
                        )
                    `, (err) => {
                        if (err) reject(err);
                        else {
                            // Add default categories after creating the table
                            createDefaultCategories();
                            resolve();
                        }
                    });
                }
            });
        });
    });
}

// Create default admin user
async function createDefaultAdmin() {
    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM admins WHERE username = ?', ['admin'], async (err, row) => {
            if (err) {
                reject(err);
            } else if (!row) {
                // Create default admin with password 'admin123'
                const hashedPassword = await bcrypt.hash('admin123', 10);
                db.run(
                    'INSERT INTO admins (username, password, email, createdAt) VALUES (?, ?, ?, ?)',
                    ['admin', hashedPassword, 'admin@scholarship.com', new Date().toISOString()],
                    (err) => {
                        if (err) {
                            reject(err);
                        } else {
                            console.log('Default admin user created (username: admin, password: admin123)');
                            resolve();
                        }
                    }
                );
            } else {
                resolve();
            }
        });
    });
}

// Save application
function saveApplication(data) {
    return new Promise((resolve, reject) => {
        const sql = `
            INSERT INTO applications (
                fullName, email, phone, dob, address, institution,
                program, gpa, year, essay, activities, transcriptPath,
                recommendationPath, status, submittedAt
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const params = [
            data.fullName, data.email, data.phone, data.dob, data.address,
            data.institution, data.program, data.gpa, data.year, data.essay,
            data.activities, data.transcriptPath, data.recommendationPath,
            data.status, data.submittedAt
        ];

        db.run(sql, params, function(err) {
            if (err) {
                reject(err);
            } else {
                resolve(this.lastID);
            }
        });
    });
}

// Get all applications
function getApplications(status = 'all') {
    return new Promise((resolve, reject) => {
        let sql = 'SELECT * FROM applications';
        let params = [];

        if (status !== 'all') {
            sql += ' WHERE status = ?';
            params.push(status);
        }

        sql += ' ORDER BY submittedAt DESC';

        db.all(sql, params, (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}

// Get application by ID
function getApplicationById(id) {
    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM applications WHERE id = ?', [id], (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(row);
            }
        });
    });
}

// Update application status
function updateApplicationStatus(id, status) {
    return new Promise((resolve, reject) => {
        const sql = 'UPDATE applications SET status = ?, updatedAt = ? WHERE id = ?';
        db.run(sql, [status, new Date().toISOString(), id], function(err) {
            if (err) {
                reject(err);
            } else {
                resolve(this.changes);
            }
        });
    });
}

// Delete application
function deleteApplication(id) {
    return new Promise((resolve, reject) => {
        db.run('DELETE FROM applications WHERE id = ?', [id], function(err) {
            if (err) {
                reject(err);
            } else {
                resolve(this.changes);
            }
        });
    });
}

// Get admin by username
function getAdmin(username) {
    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM admins WHERE username = ?', [username], (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(row);
            }
        });
    });
}

// Create default note categories
function createDefaultCategories() {
    const categories = [
        { name: 'Engineering', icon: '⚙️' },
        { name: 'Science', icon: '🔬' },
        { name: 'Mathematics', icon: '📐' },
        { name: 'History', icon: '📚' },
        { name: 'Literature', icon: '📖' },
        { name: 'Programming', icon: '💻' },
        { name: 'Business', icon: '💼' },
        { name: 'Arts', icon: '🎨' },
        { name: 'Medical', icon: '⚕️' },
        { name: 'Other', icon: '📄' }
    ];

    categories.forEach(cat => {
        db.get('SELECT * FROM note_categories WHERE name = ?', [cat.name], (err, row) => {
            if (!row) {
                db.run(
                    'INSERT INTO note_categories (name, icon, description, createdAt) VALUES (?, ?, ?, ?)',
                    [cat.name, cat.icon, `${cat.name} related notes`, new Date().toISOString()],
                    (err) => {
                        if (err) console.error('Error creating category:', err);
                    }
                );
            }
        });
    });
}

// Student functions
async function registerStudent(data) {
    return new Promise(async (resolve, reject) => {
        try {
            const hashedPassword = await bcrypt.hash(data.password, 10);
            const sql = `
                INSERT INTO students (fullName, email, password, phone, institution, program, year, bio, createdAt)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            
            db.run(sql, [
                data.fullName, data.email, hashedPassword, data.phone,
                data.institution, data.program, data.year, data.bio, new Date().toISOString()
            ], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(this.lastID);
                }
            });
        } catch (error) {
            reject(error);
        }
    });
}

function getStudentByEmail(email) {
    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM students WHERE email = ?', [email], (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
}

function getStudentById(id) {
    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM students WHERE id = ?', [id], (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
}

function updateStudentProfile(id, data) {
    return new Promise((resolve, reject) => {
        const sql = `
            UPDATE students SET fullName = ?, phone = ?, institution = ?, program = ?, year = ?, bio = ?, updatedAt = ?
            WHERE id = ?
        `;
        
        db.run(sql, [
            data.fullName, data.phone, data.institution, data.program, data.year, data.bio, new Date().toISOString(), id
        ], function(err) {
            if (err) reject(err);
            else resolve(this.changes);
        });
    });
}

// Note functions
function uploadNote(data) {
    return new Promise((resolve, reject) => {
        const sql = `
            INSERT INTO notes (title, description, categoryId, studentId, filePath, fileSize, fileType, createdAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        db.run(sql, [
            data.title, data.description, data.categoryId, data.studentId,
            data.filePath, data.fileSize, data.fileType, new Date().toISOString()
        ], function(err) {
            if (err) reject(err);
            else resolve(this.lastID);
        });
    });
}

function getNotesByCategory(categoryId) {
    return new Promise((resolve, reject) => {
        const sql = `
            SELECT n.*, s.fullName as uploaderName, s.email, c.name as categoryName, c.icon as categoryIcon
            FROM notes n
            JOIN students s ON n.studentId = s.id
            JOIN note_categories c ON n.categoryId = c.id
            WHERE n.categoryId = ? AND n.isPublished = 1
            ORDER BY n.createdAt DESC
        `;
        
        db.all(sql, [categoryId], (err, rows) => {
            if (err) reject(err);
            else resolve(rows || []);
        });
    });
}

function searchNotes(query) {
    return new Promise((resolve, reject) => {
        const sql = `
            SELECT n.*, s.fullName as uploaderName, s.email, c.name as categoryName, c.icon as categoryIcon
            FROM notes n
            JOIN students s ON n.studentId = s.id
            JOIN note_categories c ON n.categoryId = c.id
            WHERE (n.title LIKE ? OR n.description LIKE ? OR c.name LIKE ?) AND n.isPublished = 1
            ORDER BY n.createdAt DESC
        `;
        
        const searchTerm = `%${query}%`;
        db.all(sql, [searchTerm, searchTerm, searchTerm], (err, rows) => {
            if (err) reject(err);
            else resolve(rows || []);
        });
    });
}

function getNoteById(id) {
    return new Promise((resolve, reject) => {
        const sql = `
            SELECT n.*, s.fullName as uploaderName, s.email, c.name as categoryName
            FROM notes n
            JOIN students s ON n.studentId = s.id
            JOIN note_categories c ON n.categoryId = c.id
            WHERE n.id = ?
        `;
        
        db.get(sql, [id], (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
}

function updateNoteDownloads(noteId) {
    return new Promise((resolve, reject) => {
        db.run(
            'UPDATE notes SET downloads = downloads + 1, updatedAt = ? WHERE id = ?',
            [new Date().toISOString(), noteId],
            function(err) {
                if (err) reject(err);
                else resolve(this.changes);
            }
        );
    });
}

// Review functions
function addReview(data) {
    return new Promise((resolve, reject) => {
        const sql = `
            INSERT INTO note_reviews (noteId, studentId, rating, comment, createdAt)
            VALUES (?, ?, ?, ?, ?)
        `;
        
        db.run(sql, [
            data.noteId, data.studentId, data.rating, data.comment, new Date().toISOString()
        ], function(err) {
            if (err) reject(err);
            else {
                // Update note rating
                updateNoteRating(data.noteId);
                resolve(this.lastID);
            }
        });
    });
}

function getReviewsByNote(noteId) {
    return new Promise((resolve, reject) => {
        const sql = `
            SELECT r.*, s.fullName as studentName
            FROM note_reviews r
            JOIN students s ON r.studentId = s.id
            WHERE r.noteId = ?
            ORDER BY r.createdAt DESC
        `;
        
        db.all(sql, [noteId], (err, rows) => {
            if (err) reject(err);
            else resolve(rows || []);
        });
    });
}

function updateNoteRating(noteId) {
    return new Promise((resolve, reject) => {
        db.get(
            'SELECT AVG(rating) as avgRating, COUNT(*) as count FROM note_reviews WHERE noteId = ?',
            [noteId],
            (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    db.run(
                        'UPDATE notes SET rating = ?, reviewCount = ? WHERE id = ?',
                        [row.avgRating || 0, row.count || 0, noteId],
                        function(err) {
                            if (err) reject(err);
                            else resolve(this.changes);
                        }
                    );
                }
            }
        );
    });
}

function getAllCategories() {
    return new Promise((resolve, reject) => {
        db.all('SELECT * FROM note_categories ORDER BY name', [], (err, rows) => {
            if (err) reject(err);
            else resolve(rows || []);
        });
    });
}

function getStudentNotes(studentId) {
    return new Promise((resolve, reject) => {
        const sql = `
            SELECT n.*, c.name as categoryName, c.icon as categoryIcon
            FROM notes n
            JOIN note_categories c ON n.categoryId = c.id
            WHERE n.studentId = ?
            ORDER BY n.createdAt DESC
        `;
        
        db.all(sql, [studentId], (err, rows) => {
            if (err) reject(err);
            else resolve(rows || []);
        });
    });
}

// Get all notes with stats
function getAllNotesWithStats() {
    return new Promise((resolve, reject) => {
        const sql = `
            SELECT n.*, s.fullName as uploaderName, c.name as categoryName, c.icon as categoryIcon
            FROM notes n
            JOIN students s ON n.studentId = s.id
            JOIN note_categories c ON n.categoryId = c.id
            ORDER BY n.createdAt DESC
        `;
        
        db.all(sql, [], (err, rows) => {
            if (err) reject(err);
            else resolve(rows || []);
        });
    });
}

function getAllStudents() {
    return new Promise((resolve, reject) => {
        const sql = `
            SELECT id, fullName, email, phone, institution, program, year, bio, createdAt, updatedAt
            FROM students
            ORDER BY createdAt DESC
        `;

        db.all(sql, [], (err, rows) => {
            if (err) reject(err);
            else resolve(rows || []);
        });
    });
}

function getAllReviewsWithDetails() {
    return new Promise((resolve, reject) => {
        const sql = `
            SELECT r.id, r.noteId, r.studentId, r.rating, r.comment, r.createdAt,
                   s.fullName as reviewerName,
                   n.title as noteTitle,
                   c.name as categoryName,
                   u.fullName as uploaderName
            FROM note_reviews r
            JOIN students s ON r.studentId = s.id
            JOIN notes n ON r.noteId = n.id
            JOIN note_categories c ON n.categoryId = c.id
            JOIN students u ON n.studentId = u.id
            ORDER BY r.createdAt DESC
        `;

        db.all(sql, [], (err, rows) => {
            if (err) reject(err);
            else resolve(rows || []);
        });
    });
}

function deleteNoteById(noteId) {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.run('DELETE FROM note_reviews WHERE noteId = ?', [noteId], (reviewErr) => {
                if (reviewErr) {
                    reject(reviewErr);
                    return;
                }

                db.run('DELETE FROM notes WHERE id = ?', [noteId], function(err) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(this.changes);
                    }
                });
            });
        });
    });
}

// Get statistics
function getStatistics() {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            const stats = {};

            db.get('SELECT COUNT(*) as total FROM applications', (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    stats.total = row.total;

                    db.get("SELECT COUNT(*) as pending FROM applications WHERE status = 'pending'", (err, row) => {
                        if (err) {
                            reject(err);
                        } else {
                            stats.pending = row.pending;

                            db.get("SELECT COUNT(*) as approved FROM applications WHERE status = 'approved'", (err, row) => {
                                if (err) {
                                    reject(err);
                                } else {
                                    stats.approved = row.approved;

                                    db.get("SELECT COUNT(*) as rejected FROM applications WHERE status = 'rejected'", (err, row) => {
                                        if (err) {
                                            reject(err);
                                        } else {
                                            stats.rejected = row.rejected;

                                            db.get("SELECT COUNT(*) as underReview FROM applications WHERE status = 'under_review'", (err, row) => {
                                                if (err) {
                                                    reject(err);
                                                } else {
                                                    stats.underReview = row.underReview;
                                                    resolve(stats);
                                                }
                                            });
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
            });
        });
    });
}

module.exports = {
    initialize,
    saveApplication,
    getApplications,
    getApplicationById,
    updateApplicationStatus,
    deleteApplication,
    getAdmin,
    getStatistics,
    // Student functions
    registerStudent,
    getStudentByEmail,
    getStudentById,
    updateStudentProfile,
    getAllStudents,
    // Note functions
    uploadNote,
    getNotesByCategory,
    searchNotes,
    getNoteById,
    updateNoteDownloads,
    getStudentNotes,
    getAllNotesWithStats,
    deleteNoteById,
    // Review functions
    addReview,
    getReviewsByNote,
    updateNoteRating,
    getAllReviewsWithDetails,
    // Category functions
    getAllCategories
};
