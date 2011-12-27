#!/usr/bin/env node
var bb = require('./bonescript');
var fs = require('fs');
var path = require('path');
var io = require('socket.io');


setup = function() {
    var onconnect = function(socket) {
        console.log("New client connected");
        
        // send expansion pin info
        socket.emit('muxstruct', bone);

        // on message
        socket.on('message', function(data) {
            console.log("Got message from client:", data);
        });

        // on disconnect
        socket.on('disconnect', function() {
            console.log("Client disconnected.");
        });
        
        // listen for requests and reads the debugfs entry async
        socket.on('listMux', function (pinname, fn) {
            console.log(pinname + ": " + bone[pinname].mux);
            path.exists("/sys/kernel/debug/omap_mux/" + bone[pinname].mux, function (exists) {
                if(exists) {
                    fs.readFile("/sys/kernel/debug/omap_mux/" + bone[pinname].mux, 'utf8', function (err, data) {
                        fn(data, pinname);
                    });
                } else {
                    // default mux
                    console.log(bone[pinname].mux + ": default mux");
                    fn("0", pinname);
                }
            });
        });
    };
    
    var server = new bb.Server(8001, "schmux", onconnect);
    server.name = 'schmux';
    server.begin();
};

bb.run();
