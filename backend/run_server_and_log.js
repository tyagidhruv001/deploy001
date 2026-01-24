const fs = require('fs');
const { spawn } = require('child_process');

const server = spawn('node', ['server.js'], {
    env: { ...process.env, PORT: 5001 }
});

const logStream = fs.createWriteStream('server_error.log');

server.stdout.pipe(logStream);
server.stderr.pipe(logStream);

server.on('close', (code) => {
    console.log(`Server exited with code ${code}`);
    logStream.end();
});
