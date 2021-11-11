const { deepStrictEqual } = require('assert');
const http = require('http'),
    fs = require('fs'),
    url = require('url');

http.createServer((req, resp) => {
    let addr = req.url,
        q = url.parse(addr, true),
        filePath = '';

    fs.appendFile('log.txt', 'URL: ' + addr + '\nTimestamp: ' + new Date() + '\n\n', (err) => {
        if (err) console.log(err);
        else console.log('Added to log.');
    });

    if (q.pathname.includes('documentation')) {
        filePath = (__dirname + './documentation.html');
    }
    else filePath = 'index.html';

    fs.readFile(filePath, (err, data) => {
        if (err) throw err;

        resp.writeHead(200, { 'Content-Type': 'text/html' });
        resp.write(data);
        resp.end();
    });

}).listen(8080);

console.log('My fist Node test server is running on port 8080.');