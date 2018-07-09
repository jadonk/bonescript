// Copyright (C) 2011 - Texas Instruments, Jason Kridner
//
//
var b = require('../main');
var fs = require('fs');
var url = require('url');
var child_process = require('child_process');
var winston = require('winston');
var socketio = require('socket.io');
var debug = process.env.DEBUG ? true : false;

var socketJSReqHandler = function (req, res) {
    function sendFile(err, file) {
        if (err) {
            res.writeHead(500, {
                "Content-Type": "text/plain"
            });
            res.end(err + '\n');
            return;
        }
        res.setHeader('Content-Type', 'text/javascript');
        file = file.replace(/___INSERT_HOST___/g, host);
        res.end(file);
    }
    var parsedUrl = url.parse(req.url);
    var uri = parsedUrl.pathname;
    var host = 'http://' + req.headers.host;
    if (uri == '/bonescript.js') {
        var filename = __dirname + '/bonescript.js';
        if (debug) winston.debug('filename = ' + filename)
        fs.readFile(filename, 'utf8', sendFile);
    }
}

var addSocketListeners = function (server, serverEmitter, passphrase_hash) {
    var io = socketio(server);
    if (passphrase_hash) { //attach middleware to handle authentication
        io.use(function (socket, next) {
            socket.auth = false; //consider the all sockets initially as unauthorized 
            if (socket.handshake.headers.authorization) {
                if (socket.handshake.headers.authorization == passphrase_hash) {
                    socket.auth = true; //authorize the socket
                    next();
                } else
                    next(new Error("Authentication Failed : incorrect passphrase !!"));
            } else {
                next(new Error("Authentication data not send !!"));
            }
        });
    }
    if (debug) winston.debug('Listening for new socket.io clients');
    io.on('connection', function (socket) {
        if (socket.auth || !passphrase_hash)
            onconnect(socket);
        else
            socket.disconnect('unauthorized');
    });

    function onconnect(socket) {
        winston.debug('Client connected');
        serverEmitter.emit('socket$connect', socket);

        // on disconnect
        socket.on('disconnect', function () {
            if (debug) winston.debug('Client disconnected');
            serverEmitter.emit('socket$disconnect');
        });

        socket.on('message', serverMessage);

        spawn(socket);

        var modmsg = {};
        modmsg.module = 'bonescript';
        modmsg.data = {};

        var callMyFunc = function (name, m) {
            var myCallback = function (resp) {
                if (debug) winston.debug(name + ' replied to ' + JSON.stringify(m) + ' with ' + JSON.stringify(resp));
                if (typeof m.seq == 'undefined') return;
                if (!resp || (typeof resp != 'object')) resp = {
                    'data': resp
                };
                resp.seq = m.seq;
                // TODO: consider setting 'oneshot'
                if (debug) winston.debug('Sending message "bonescript": ' + JSON.stringify(resp));
                socket.emit('bonescript', resp);
            };
            var myCallback_nodestyle = function (err, resp) {
                if (debug) winston.debug(name + ' replied to ' + JSON.stringify(m) + ' with ' + JSON.stringify(resp));
                if (typeof m.seq == 'undefined') return;
                // TODO: consider setting 'oneshot'
                if (debug) winston.debug('Sending message "bonescript": ' + JSON.stringify(resp));
                socket.emit('bonescript', {
                    err: err,
                    resp: resp,
                    seq: m.seq
                });
            };
            try {
                var callargs = [];
                for (var arg in b[name].args) {
                    var argname = b[name].args[arg];
                    if (argname == 'callback') {
                        if (typeof m.seq == 'number') {
                            if (m.length == 1)
                                callargs.push(myCallback);
                            else
                                callargs.push(myCallback_nodestyle);
                        } else callargs.push(null);
                    } else if (typeof m[argname] != 'undefined') {
                        callargs.push(m[argname]);
                    } else {
                        callargs.push(undefined);
                    }
                }
                if (debug) winston.debug('Calling ' + name + '(' + callargs.join(',') + ')');
                b[name].apply(this, callargs);
            } catch (ex) {
                if (debug) winston.debug('Error handing ' + name + ' message: ' + ex);
                if (debug) winston.debug('m = ' + JSON.stringify(m));
            }
        };

        var addSocketX = function (message, name) {
            var onFuncMessage = function (m) {
                callMyFunc(name, m);
            };
            socket.on(message, onFuncMessage);
        };

        var b = require('../main');
        for (var i in b) {
            if (typeof b[i] == 'function') {
                if (typeof b[i].args != 'undefined') {
                    modmsg.data[i] = {};
                    modmsg.data[i].name = i;
                    modmsg.data[i].type = 'function';
                    modmsg.data[i].value = b[i].args;
                    addSocketX('bonescript$' + i, i);
                }
            } else {
                modmsg.data[i] = {};
                modmsg.data[i].name = i;
                modmsg.data[i].type = typeof b[i];
                modmsg.data[i].value = b[i];
            }
        }

        socket.emit('require', modmsg);
    }

    function serverMessage(message) {
        serverEmitter.emit('message', message);
    }

    return (io);
}
// most heavily borrowed from https://github.com/itchyny/browsershell
function spawn(socket) {
    var stream = '';
    var timer;
    var len = 0;
    var c;

    socket.on('shell', receive);
    return (receive);

    function receive(msg) {
        if (!c) {
            try {
                if (debug) winston.debug('Spawning bash');
                c = child_process.spawn('/bin/bash', ['-i'], {
                    customFds: [-1, -1, -1]
                });
                c.stdout.on('data', send);
                c.stderr.on('data', send);
                c.on('exit', function () {
                    socket.emit('shell', send('\nexited\n'));
                    c = undefined;
                });
                socket.on('disconnect', function () {
                    if (debug) winston.debug('Killing bash');
                    c.kill('SIGHUP');
                });
            } catch (ex) {
                c = undefined;
                send('Error invoking bash');
                winston.error('Error invoking bash');
            }
        }
        if (c) {
            if (msg) {
                c.stdin.write(msg + '\n', 'utf-8');
            }
        } else {
            winston.error('Unable to invoke child process');
        }
    }

    function send(data) {
        // add data to the stream
        stream += data.toString();
        ++len;

        // clear any existing timeout if it exists
        if (timer) clearTimeout(timer);

        // set new timeout
        timer = setTimeout(function () {
            socket.emit('shell', stream);
            stream = '';
            len = 0;
        }, 100);

        // send data if over threshold
        if (len > 1000) {
            clearTimeout(timer);
            socket.emit('shell', stream);
            stream = '';
            len = 0;
        }
    }
}

module.exports = {
    socketJSReqHandler: socketJSReqHandler,
    addSocketListeners: addSocketListeners
}