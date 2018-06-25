// Copyright (C) 2011 - Texas Instruments, Jason Kridner
//
//
var fs = require('fs');
var http = require('http');
var winston = require('winston');
var express = require('express');
var events = require('events');
var socketHandlers = require('./socket_handlers');
var expressSession = require('express-session');
var auth = require('basic-auth');
var sessionStore = new expressSession.MemoryStore();

var session = expressSession({
    name: "connect.sid",
    secret: "secretkey",
    cookie: {
        httpOnly: true
    },
    saveUninitialized: true,
    resave: true,
    store: sessionStore
});

var serverEmitter = new events.EventEmitter();

var debug = process.env.DEBUG ? true : false;

myrequire('systemd', function () {
    if (debug) winston.debug("Startup as socket-activated service under systemd not enabled");
});

var serverStart = function (port, directory, credentials, callback) {
    if (port === undefined) {
        port = (process.env.LISTEN_PID > 0) ? 'systemd' : ((process.env.PORT) ? process.env.PORT : 80);
    }
    if (directory === undefined) {
        directory = (process.env.SERVER_DIR) ? process.env.SERVER_DIR : '/usr/share/bone101';
    }
    var server = mylisten(port, directory, credentials);
    serverEmitter.on('newListner', addServerListener);

    function addServerListener(event, listener) {
        console.log('got here'); //TODO: not getting here
        if (debug) winston.debug('Got request to add listener to ' + event);
        var serverEvent = event.replace(/^server\$/, '');
        if (serverEvent) {
            if (debug) winston.debug('Adding listener to server$' + serverEvent);
            server.on(serverEvent, listener);
        }
    }

    if (callback) {
        callback({
            server: server,
            serverEmitter: serverEmitter
        });
    }

    return (serverEmitter);
};

function mylisten(port, directory, credentials) {
    winston.info("Opening port " + port + " to serve up " + directory);
    var app = express();
    app.get('/bonescript.js', socketHandlers.socketJSReqHandler);
    app.use(session); //use the session middleware
    app.get('/login', function (req, res) {
        var user = auth(req);
        if (!user) {
            res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
            return res.sendStatus(401);
        }
        if (credentials) { //store the session details
            req.session.isLoggedIn = (user.name == credentials.username && user.pass == credentials.password);
            req.session.secure = true;
        } else
            req.session.secure = false; //if credentials not supplied during creation of server save the sesssion without the secure flag
        socketHandlers.updateSession(sessionStore); //update the socket handlers session-store
        res.redirect('/');
    });
    app.use('/bone101', express.static(directory));
    app.use('/bone101/static', express.static(directory + "/static"));
    app.use(express.static(directory));
    var server = http.createServer(app);
    socketHandlers.addSocketListeners(server, serverEmitter, session);
    server.listen(port);
    return (server);
}

function myrequire(packageName, onfail) {
    var y = {};
    try {
        y = require(packageName);
        y.exists = true;
    } catch (ex) {
        y.exists = false;
        if (debug) winston.debug("Optional package '" + packageName + "' not loaded");
        if (onfail) onfail();
    }
    return (y);
}

module.exports = {
    serverStart: serverStart
}