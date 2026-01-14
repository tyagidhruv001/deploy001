const http = require('http');

function testSignup() {
    console.log('--- Testing Signup ---');
    const newUser = {
        name: 'Debug User',
        email: `debug_user_${Date.now()}@example.com`,
        phone: '+919999999999',
        password: 'password123',
        role: 'customer'
    };

    const data = JSON.stringify(newUser);

    const options = {
        hostname: 'localhost',
        port: 5000,
        path: '/api/auth/signup',
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
            if (res.statusCode === 201) {
                console.log('✅ Signup Passed');
            } else {
                console.log('❌ Signup Failed');
            }
        });
    });

    req.on('error', (error) => {
        console.error('❌ Network/Server Error:', error.message);
    });

    req.write(data);
    req.end();
}

testSignup();
