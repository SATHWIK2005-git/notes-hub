const http = require('http');

function request(path, method = 'GET', body = null, cookie = '') {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data ? Buffer.byteLength(data) : 0,
        ...(cookie ? { Cookie: cookie } : {})
      }
    }, (res) => {
      let raw = '';
      res.on('data', chunk => raw += chunk);
      res.on('end', () => {
        let parsed = raw;
        try { parsed = JSON.parse(raw); } catch {}
        resolve({ status: res.statusCode, body: parsed, headers: res.headers });
      });
    });

    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

(async () => {
  try {
    const unauth = await request('/api/admin/students');
    console.log('Unauth /api/admin/students:', unauth.status);

    const login = await request('/api/admin/login', 'POST', { username: 'admin', password: 'admin123' });
    console.log('Login status:', login.status);

    const setCookie = login.headers['set-cookie'];
    if (!setCookie || !setCookie.length) {
      console.log('No session cookie received');
      return;
    }

    const sessionCookie = setCookie[0].split(';')[0];

    const students = await request('/api/admin/students', 'GET', null, sessionCookie);
    const notes = await request('/api/admin/notes', 'GET', null, sessionCookie);
    const reviews = await request('/api/admin/reviews', 'GET', null, sessionCookie);

    console.log('Students status/count:', students.status, Array.isArray(students.body) ? students.body.length : 'n/a');
    console.log('Notes status/count:', notes.status, Array.isArray(notes.body) ? notes.body.length : 'n/a');
    console.log('Reviews status/count:', reviews.status, Array.isArray(reviews.body) ? reviews.body.length : 'n/a');
  } catch (error) {
    console.error('Test failed:', error.message);
    process.exit(1);
  }
})();