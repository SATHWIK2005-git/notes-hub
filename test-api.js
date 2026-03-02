// Diagnostic Test - Run this to check what's wrong
// Save as: test-api.js and run with: node test-api.js

const http = require('http');

console.log('🔍 Testing Scholarship Application API...\n');

// Test 1: Check if server is running
console.log('1️⃣  Testing if server is running...');
const testServer = () => {
    const options = {
        hostname: 'localhost',
        port: 3000,
        path: '/api/applications',
        method: 'GET'
    };

    const req = http.request(options, (res) => {
        console.log('✅ Server is running! (Status: ' + res.statusCode + ')\n');
        
        let data = '';
        res.on('data', (chunk) => {
            data += chunk;
        });
        
        res.on('end', () => {
            try {
                const result = JSON.parse(data);
                console.log('📊 Database Results:');
                console.log(`   • Total Applications: ${result.count}`);
                console.log(`   • Applications in database:\n`);
                if (result.applications && result.applications.length > 0) {
                    result.applications.forEach((app, index) => {
                        console.log(`     ${index + 1}. ${app.fullName} - ${app.email}`);
                    });
                } else {
                    console.log('     (No applications yet)');
                }
                console.log('\n✨ Everything is working correctly!\n');
            } catch (e) {
                console.log('Data received:', data);
            }
        });
    });

    req.on('error', (error) => {
        console.log('❌ Server is NOT running!\n');
        console.log('⚠️  Error:', error.message);
        console.log('\n📝 To start the server:');
        console.log('   1. Open terminal in your project folder');
        console.log('   2. Run: npm install (if not done yet)');
        console.log('   3. Run: npm start');
        console.log('   4. Open: http://localhost:3000');
    });

    req.end();
};

testServer();

// Test 2: Check database
setTimeout(() => {
    console.log('\n2️⃣  Checking database...');
    const dbPath = require('path').join(__dirname, 'scholarship.db');
    const fs = require('fs');
    
    if (fs.existsSync(dbPath)) {
        console.log('✅ Database file exists at: ' + dbPath);
        const stats = fs.statSync(dbPath);
        console.log(`   • Size: ${(stats.size / 1024).toFixed(2)} KB`);
    } else {
        console.log('❌ Database file NOT found! It will be created on first server run.');
    }
}, 1000);

// Test 3: Check dependencies
setTimeout(() => {
    console.log('\n3️⃣  Checking dependencies...');
    const packages = ['express', 'sqlite3', 'multer', 'bcrypt', 'nodemailer'];
    packages.forEach(pkg => {
        try {
            require(pkg);
            console.log(`✅ ${pkg} is installed`);
        } catch (e) {
            console.log(`❌ ${pkg} is NOT installed`);
        }
    });
}, 2000);
