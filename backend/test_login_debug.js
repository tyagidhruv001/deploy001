const http = require('http');

function testLogin() {
    console.log('--- Testing Login ---');
    // Using the same data as the signup debug script or a likely user
    const loginData = {
        idToken: 'mock-token-debug',
        phone: '+919999999999' // The phone number used in the signup test
    };

    const data = JSON.stringify(loginData);

    const options = {
        hostname: 'localhost',
        port: 5000,
        path: '/api/auth/login',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': data.length
        }
    };

    const req = http.request(options, (res) => {
        console.log(`Status: ${res.statusCode}`);
        let body = '';
        res.on('data', (chunk) => body += chunk);
        res.on('end', () => {
            console.log('Response:', body);
        });
    });

    req.on('error', (error) => {
        console.error('❌ Network/Server Error:', error.message);
    });

    req.write(data);
    req.end();
}

testLogin();
