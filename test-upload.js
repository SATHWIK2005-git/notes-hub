// Test note upload functionality
// Save as: test-upload.js and run with: node test-upload.js

const http = require('http');
const fs = require('fs');
const path = require('path');

console.log('🔍 Checking Note Upload System...\n');

// Check 1: Verify uploads/notes directory exists
console.log('1️⃣  Checking uploads directory structure...');
const uploadsDir = path.join(__dirname, 'uploads');
const notesDir = path.join(__dirname, 'uploads/notes');

if (fs.existsSync(uploadsDir)) {
    console.log('✅ /uploads directory exists');
} else {
    console.log('❌ /uploads directory missing - creating it...');
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('✅ /uploads created');
}

if (fs.existsSync(notesDir)) {
    console.log('✅ /uploads/notes directory exists');
    const files = fs.readdirSync(notesDir);
    console.log(`   Files stored: ${files.length}`);
    files.forEach(f => console.log(`   • ${f}`));
} else {
    console.log('❌ /uploads/notes directory missing - creating it...');
    fs.mkdirSync(notesDir, { recursive: true });
    console.log('✅ /uploads/notes created');
}

// Check 2: Verify multer is installed
console.log('\n2️⃣  Checking multer module...');
try {
    const multer = require('multer');
    console.log('✅ multer is installed');
} catch (e) {
    console.log('❌ multer is NOT installed - install with: npm install multer');
}

// Check 3: Verify database has students and notes tables
console.log('\n3️⃣  Checking database tables...');
const sqlite3 = require('sqlite3');
const dbPath = path.join(__dirname, 'scholarship.db');

if (fs.existsSync(dbPath)) {
    console.log('✅ Database file exists');
    
    const db = new sqlite3.Database(dbPath);
    
    // Check students table
    db.all("SELECT name FROM sqlite_master WHERE type='table' AND name='students'", (err, rows) => {
        if (rows && rows.length > 0) {
            console.log('✅ students table exists');
            
            db.get('SELECT COUNT(*) as count FROM students', (err, row) => {
                console.log(`   Students registered: ${row.count}`);
            });
        } else {
            console.log('❌ students table NOT found - run server to create');
        }
    });
    
    // Check notes table
    db.all("SELECT name FROM sqlite_master WHERE type='table' AND name='notes'", (err, rows) => {
        if (rows && rows.length > 0) {
            console.log('✅ notes table exists');
            
            db.get('SELECT COUNT(*) as count FROM notes', (err, row) => {
                console.log(`   Notes uploaded: ${row.count}`);
            });
        } else {
            console.log('❌ notes table NOT found - run server to create');
        }
    });
    
    // Check categories
    db.all("SELECT COUNT(*) as count FROM note_categories", (err, row) => {
        console.log(`   Categories available: ${row.count}`);
        
        db.all("SELECT * FROM note_categories LIMIT 5", (err, rows) => {
            console.log('   Sample categories:');
            rows.forEach(r => console.log(`     • ${r.icon} ${r.name}`));
            db.close();
        });
    });
} else {
    console.log('❌ Database file missing');
}

// Check 4: Test API endpoint
console.log('\n4️⃣  Testing upload endpoint availability...');
const testOptions = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/notes/categories',
    method: 'GET'
};

const req = http.request(testOptions, (res) => {
    console.log(`✅ Server responding (Status: ${res.statusCode})`);
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        try {
            const result = JSON.parse(data);
            if (result.success) {
                console.log(`✅ Upload endpoint working - ${result.categories.length} categories available`);
            }
        } catch (e) {}
    });
});

req.on('error', (error) => {
    console.log('❌ Server not responding - make sure it\'s running with: npm start');
});

req.end();

// Check 5: Permissions
console.log('\n5️⃣  Checking file permissions...');
try {
    const testFile = path.join(notesDir, '.test');
    fs.writeFileSync(testFile, 'test');
    fs.unlinkSync(testFile);
    console.log('✅ Write permissions OK for upload directory');
} catch (e) {
    console.log('❌ No write permissions to uploads directory');
}

console.log('\n✨ Diagnostic complete!');
