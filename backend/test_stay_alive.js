
const http = require('http');
const server = http.createServer((req, res) => {
    res.end('ok');
});
server.listen(5000, '0.0.0.0', () => {
    console.log('HTTP Server listening on 5000');
});
// Prevent script from exiting
setInterval(() => { }, 1000);
