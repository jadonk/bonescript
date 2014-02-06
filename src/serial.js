// Copyright (C) 2013 - Texas Instruments, Jason Kridner
var bone = require('./bone');
var my = require('./my');

var m = {};
m.name = 'serialport';
m.module = my.require('serialport');
m.ports = bone.uarts;
m.events = {
    'open': [],
    'data': ['data']
};
m.openPorts = {};
m.doOpen = function(args) {
    var path = args.port;
    if(m.ports[args.port].path) path = m.ports[args.port].path;
    var openPort = new m.module.SerialPort(path, args.options);
    return(openPort);
};

exports.serialOpen = my.wrapOpen(m, ['options']);
exports.serialWrite = my.wrapCall(m, 'write', ['data'], ['err', 'results']);
