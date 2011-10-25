var bb = require('./bonescript');
var http = require('http');

var server = function(req, res) {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('Hello World\n');
};

setup = function() {
    http.createServer(server).listen(80, "0.0.0.0");
};

loop = function() {
};

bb.run();
