// Copyright (C) 2011 - Texas Instruments, Jason Kridner
//
//
var fs = require('fs');
var http = require('http');
var winston = require('winston');
var express = require('express');
var events = require('events');
var crypto = require('crypto');
var socketHandlers = require('./socket_handlers');

var serverEmitter = new events.EventEmitter();

var debug = process.env.DEBUG ? true : false;

myrequire('systemd', function () {
    if (debug) winston.debug("Startup as socket-activated service under systemd not enabled");
});

var serverStart = function (port, directory, passphrase, callback) {
    if (port === undefined) {
        port = (process.env.LISTEN_PID > 0) ? 'systemd' : ((process.env.PORT) ? process.env.PORT : 80);
    }
    if (directory === undefined) {
        directory = (process.env.SERVER_DIR) ? process.env.SERVER_DIR : '/usr/share/bone101';
    }
    var passphrase_hash;
    if (passphrase) {
        if (passphrase.hash) //whether passphrase supplied as hash/text
            passphrase_hash = passphrase.data;
        else
            passphrase_hash = crypto.createHash('sha256').update(passphrase.data).digest("hex"); //generate hash
    }
    var server = mylisten(port, directory, passphrase_hash);
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

function mylisten(port, directory, passphrase_hash) {
    winston.info("Opening port " + port + " to serve up " + directory);
    var app = express();
    app.get('/bonescript.js', socketHandlers.socketJSReqHandler);
    app.use('/bone101', express.static(directory));
    app.use('/bone101/static', express.static(directory + "/static"));
    app.use(express.static(directory));
    var server = http.createServer(app);
    socketHandlers.addSocketListeners(server, serverEmitter, passphrase_hash);
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