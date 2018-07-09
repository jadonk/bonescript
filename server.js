var b = require('bonescript');
var util = require('util');
var fs = require('fs');
var configFile = '/etc/default/bonescript';
var server;
//read the configuration from configFile
fs.readFile(configFile, {
    encoding: 'ascii'
}, function read(err, data) {
    if (err) {
        server = b.serverStart(); //start server with default settings
    } else {
        data = JSON.parse(data); //start server with saved config
        server = b.serverStart(data.port, data.directory, {
            data: data.passphrase,
            hash: data.hash
        });
    }
    onServerStart();
});

function onServerStart() {
    server.on('server$listening', serverListening);
    server.on('server$error', serverError);
    server.on('server$connection', serverConnection);
}

function serverListening() {
    if (debug) winston.debug('Server listening');
}

function serverError(error) {
    if (debug) winston.debug('Server error: ' + JSON.stringify(error));
}

function serverConnection(connection) {
    if (debug) winston.debug('Server connection: ' + connection);
}