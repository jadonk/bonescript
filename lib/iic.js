// Copyright (C) 2013 - Texas Instruments, Jason Kridner
// Modified by Aditya Patadia, Octal Consulting LLP
var pinmap = require('./pinmap');
var bone = require('./bone');

var m = {};
m.name = 'i2c';
m.module = bone.require('i2c');
m.ports = pinmap.i2c;
m.events = {
    'data': ['data']
};
m.openPorts = {};
m.doOpen = function(args) {
    var path = args.port;
    if(m.ports[args.port].path) path = m.ports[args.port].path;
    if(typeof args.options !== typeof {}) args.options = {};
    args.options.device = path;
    var openPort = new m.module(args.address, args.options);
    return(openPort);
};

exports.i2cOpen = bone.wrapOpen(m, ['address', 'options']);
exports.i2cScan = bone.wrapCall(m, 'scan', [], ['err', 'data']);
exports.i2cWriteByte = bone.wrapCall(m, 'writeByte', ['byte'], ['err']);
exports.i2cWriteBytes = bone.wrapCall(m, 'writeBytes', ['command', 'bytes'], ['err']);
exports.i2cReadByte = bone.wrapCall(m, 'readByte', [], ['err', 'res']);
exports.i2cReadBytes = bone.wrapCall(m, 'readBytes', ['command', 'length'], ['err', 'res']);
exports.i2cStream = bone.wrapCall(m, 'stream', ['command', 'length', 'delay'], []);
