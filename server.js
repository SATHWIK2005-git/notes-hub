const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Start the backend server
const backendApp = require('./notes-hub/backend/server');

// Serve static frontend files  
app.use(express.static(path.join(__dirname, 'notes-hub/frontend')));

// Use all backend routes
app.use(backendApp);

// Fallback to frontend for SPA routing
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'notes-hub/frontend/index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = app;
