// Copyright (C) 2013 - Texas Instruments, Jason Kridner
// Modified by Aditya Patadia, Octal Consulting LLP
var pinmap = require('./pinmap');
var bone = require('./bone');

var m = {};
m.name = 'serialport';
m.module = bone.require('serialport');
m.ports = pinmap.uarts;
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

module.exports = {
	serialOpen : bone.wrapOpen(m, ['options']),
	serialWrite: bone.wrapCall(m, 'write', ['data'], ['err', 'results']),
	serialParsers: m.module.exists ? m.module.parsers : {}
};
