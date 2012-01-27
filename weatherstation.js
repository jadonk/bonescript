#!/usr/bin/env node
var bb = require('./bonescript');
var fs = require('fs');
var io = require('socket.io');
var pconfig = require('./weatherstation/bmp085-pressure');


setup = function() {
    try {
        fs.writeFileSync('/sys/class/i2c-adapter/i2c-3/new_device', 'bmp085 0x77', encoding='ascii');
    } catch(ex) {
        console.log('bmp085 driver load failed.');
    }
    var onconnect = function(socket) {
        console.log("New client connected");
        var pdelay = pconfig.pressureConfig.delay;
        var pscale = pconfig.pressureConfig.scale;
        var pfileData = pconfig.pressureConfig.file;

        var preadData = function(fd) {
            fs.readFile(pfileData, function(err, data) {
                if(err) throw("Unable to read data: " + err);
                socket.emit('pressuredata', "" + data / pscale);
            });
            setTimeout(preadData, pdelay);
        };

        var tdelay = pconfig.tempConfig.delay;
        var tscale = pconfig.tempConfig.scale;
        var tfileData = pconfig.tempConfig.file;
        
        var treadData = function(fd) {
            fs.readFile(tfileData, function(err, data) {
                if(err) throw("Unable to read data: " + err);
                socket.emit('tempdata', "" + data / tscale);
            });
            setTimeout(treadData, tdelay);
        };

        socket.emit('pressureconfig', pconfig.pressureConfig);
        socket.emit('tempconfig', pconfig.tempConfig);
        setTimeout(treadData, tdelay);
        setTimeout(preadData, pdelay);

        // on message
        socket.on('message', function(data) {
            console.log("Got message from client:", data);
        });

        // on disconnect
        socket.on('disconnect', function() {
            console.log("Client disconnected.");
        });
    };
    
    var server = new bb.Server(8000, "weatherstation", onconnect);
    server.name = 'weatherstation';
    server.begin();
};

bb.run();
