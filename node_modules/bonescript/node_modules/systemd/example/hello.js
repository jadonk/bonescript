var http = require('http');

require('../lib/systemd');

var port = process.env.LISTEN_PID > 0 ? 'systemd' : 1337;
http.createServer(function (req, res) {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('Hello World\n');
}).listen(port);
