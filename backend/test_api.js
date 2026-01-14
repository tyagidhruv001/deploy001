const http = require('http');

function makeRequest(path, method = 'GET', body = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 5000,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                resolve({ status: res.statusCode, body: data });
            });
        });

        req.on('error', (e) => reject(e));

        if (body) {
            req.write(JSON.stringify(body));
        }
        req.end();
    });
}

async function testBackend() {
    console.log('Testing Backend API (using http module)...');

    try {
        // 1. Test Root
        const root = await makeRequest('/');
        console.log(`[GET] /: ${root.status} - ${root.body}`);

        // 2. Test Workers Route
        const workers = await makeRequest('/api/workers');
        console.log(`[GET] /api/workers: ${workers.status} - Response: ${workers.body}`);

        // 3. Test Auth Login (Mock)
        const login = await makeRequest('/api/auth/login', 'POST', { idToken: 'test' });
        console.log(`[POST] /api/auth/login: ${login.status} - ${login.body}`);

    } catch (error) {
        console.error('Test failed:', error.message);
    }
}

testBackend();
