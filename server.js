var b = require('bonescript');
var util = require('util');

var server = b.serverStart();

server.on('server$listening', serverListening);
server.on('server$error', serverError);
server.on('server$connection', serverConnection);

function serverListening() {
    if(debug) winston.debug('Server listening');
}

function serverError(error) {
    if(debug) winston.debug('Server error: ' + JSON.stringify(error));
}

function serverConnection(connection) {
    if(debug) winston.debug('Server connection: ' + connection);
}

