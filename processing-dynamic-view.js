#!/usr/bin/env node
var bb = require('./bonescript');
var fs = require('fs');
var io = require('socket.io');
var config = require('./processing-dynamic-view/config');

setup = function() {
    var onconnect = function(socket) {
        console.log("New client connected");
        var delay = config.dynviewConfig.delay;
        var scale = config.dynviewConfig.scale;
        
        var fileData =
            "/var/lib/cloud9/processing-dynamic-view/data";

        var readData = function(fd) {
            fs.readFile(fileData, function(err, data) {
                if(err) throw("Unable to read data: " + err);
                socket.emit('data', "" + data / scale);
            });
            setTimeout(readData, delay);
        };

        socket.emit('config', config.dynviewConfig);
        setTimeout(readData, delay);

        // on message
        socket.on('message', function(data) {
            console.log("Got message from client:", data);
        });

        // on disconnect
        socket.on('disconnect', function() {
            console.log("Client disconnected.");
        });
    };
    var server = new bb.Server(8000, "processing-dynamic-view", onconnect);
    server.begin();
};

bb.run();
