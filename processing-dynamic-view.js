#!/usr/bin/env node
var fs = require('fs');
var io = require('socket.io');
var bb = require('./bonescript');

var server;

setup = function() {
    server = new bb.Server(8000, "processing-dynamic-view");
    server.begin(); 
    server.socket.on('connection', function(client) {
        sys.puts("New client connected");
        
        var fileTemp0 = 
            "/sys/devices/platform/omap/omap_i2c.3/i2c-3/3-0077/temp0_input";
            
        var sendTemp0 = function(err, data) {
            client.send(data);
        };
    
        var readTemp0 = function(fd) {
            fs.readFile(fileTemp0, sendTemp0(err, data));
            setTimeout(readTemp0, 1000);
        };
        
        // start collecting and sending
        setTimeout(readTemp0, 1000);
    
     
        // on message
        client.on('message', function(data) {
            sys.puts("Got message from client:", data);
        });
     
        // on disconnect
        client.on('disconnect', function() {
            sys.puts("Client disconnected.");
        }); 
    }); 
};

bb.run();