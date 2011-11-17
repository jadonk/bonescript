#!/usr/bin/env node
var bb = require('./bonescript');
var fs = require('fs');
var io = require('socket.io');

setup = function() {
    var onconnect = function(socket) {
        console.log("New client connected");
        var delay = 1000;
        var scale = 1;
        
        var fileData =
            "/var/lib/cloud9/processing-dynamic-view/data";
        var fileRangeLow =
            "/var/lib/cloud9/processing-dynamic-view/rangeLow";
        var fileRangeHigh =
            "/var/lib/cloud9/processing-dynamic-view/rangeHigh";
        var fileRate =
            "/var/lib/cloud9/processing-dynamic-view/delay";       
        var fileScale =
            "/var/lib/cloud9/processing-dynamic-view/scale";

        fs.readFile(fileScale, function(err, data) {
            if(err) throw("Unable to read scale: " + err);
            scale = data;
        });
        
        var readData = function(fd) {
            fs.readFile(fileData, function(err, data) {
                if(err) throw("Unable to read data: " + err);
                socket.emit('data', "" + data / scale);
            });
            setTimeout(readData, delay);
        };
        
        fs.readFile(fileRangeLow, function(err, data) {
            if(err) throw("Unable to read rangeLow: " + err);
            socket.emit('rangeLow', "" + data);
        });
            
        fs.readFile(fileRangeHigh, function(err, data) {
            if(err) throw("Unable to read rangeHigh: " + err);
            socket.emit('rangeHigh', "" + data);
        });
            
        fs.readFile(fileRate, function(err, data) {
            if(err) throw("Unable to read delay: " + err);
            delay = data;
            setTimeout(readData, delay);
        });

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
