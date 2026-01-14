const http = require('http');

const data = JSON.stringify({
    message: "How do I book a plumber?",
    previousHistory: [],
    workerContext: { type: 'platform_assistant' }
});

const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/chat',
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
        console.log(`Response: ${body}`);
    });
});

req.on('error', (error) => {
    console.error('Error:', error);
});

req.write(data);
req.end();
