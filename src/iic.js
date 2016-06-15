// Copyright (C) 2013 - Texas Instruments, Jason Kridner
var bone = require('./bone');
var my = require('./my');

var m = {};
m.name = 'i2c';
m.module = my.require('i2c-bus');
m.ports = bone.i2c;
m.events = {
    'data': ['data']
};
m.openPorts = {};
m.doOpen = function(args) {
    var path = args.port[0];
    if(m.ports[args.port[0]].path) path = m.ports[args.port[0]].path;
    if(typeof args.options !== typeof {}) args.options = {};
    args.options.device = path;
    var openPort = new m.module(args.port[1], args.options);
    return(openPort);
};

exports.i2cOpen = my.wrapOpen(m, ['options']);
exports.i2cScan = my.wrapCall(m, 'scan', [], ['err', 'data']);
exports.i2cWriteByte = my.wrapCall(m, 'writeByte', ['byte'], ['err']);
exports.i2cWriteBytes = my.wrapCall(m, 'writeBytes', ['command', 'bytes'], ['err']);
exports.i2cReadByte = my.wrapCall(m, 'readByte', [], ['err', 'res']);
exports.i2cReadBytes = my.wrapCall(m, 'readBytes', ['command', 'length'], ['err', 'res']);
exports.i2cStream = my.wrapCall(m, 'stream', ['command', 'length', 'delay'], []);
