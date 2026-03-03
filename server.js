const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Load backend database module to initialize it
const database = require('./notes-hub/backend/database');

// Start the backend Express app (with all API routes)
const backendApp = require('./notes-hub/backend/server');

let dbInitPromise;
const ensureDatabaseInitialized = () => {
    if (!dbInitPromise) {
        dbInitPromise = database.initialize();
    }
    return dbInitPromise;
};

// Serve static frontend files  
app.use(express.static(path.join(__dirname, 'notes-hub/frontend')));

// Ensure DB initialization before handling API routes
app.use(async (req, res, next) => {
    try {
        await ensureDatabaseInitialized();
        next();
    } catch (err) {
        console.error('Database initialization failed:', err);
        res.status(500).json({ success: false, error: 'Database initialization failed' });
    }
});

// Mount all backend API routes
app.use(backendApp);

// Fallback to frontend for SPA routing
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'notes-hub/frontend/index.html'));
});

module.exports = app;

if (require.main === module) {
    ensureDatabaseInitialized().then(() => {
        app.listen(PORT, () => {
            console.log(`\n✓ Notes Hub Server running on http://localhost:${PORT}`);
            console.log(`✓ API: http://localhost:${PORT}/api`);
            console.log(`✓ Frontend: http://localhost:${PORT}\n`);
        });
    }).catch(err => {
        console.error('Failed to initialize:', err);
        process.exit(1);
    });
}
