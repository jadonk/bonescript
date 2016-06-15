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
    //var openPort = new m.module(args.port[1], args.options);
    var devId = args.options.hwInterface ? args.options.device.substring(3) : 1
    var i2cBus = m.module.open(devId)
    i2cBus.address = args.port[1]
    return(i2cBus);
};

exports.i2cOpen = my.wrapOpen(m, m.address, ['options']);
exports.i2cScan = my.wrapCall(m, m.address, 'scan', [], ['err', 'data']);
exports.i2cWriteByte = my.wrapCall(m, m.address, 'writeByte', ['byte'], ['err']);
exports.i2cWriteBytes = my.wrapCall(m, m.address, 'writeBytes', ['command', 'bytes'], ['err']);
exports.i2cReadByte = my.wrapCall(m, m.address, 'readByte', [], ['err', 'res']);
exports.i2cReadBytes = my.wrapCall(m, m.address, 'readBytes', ['command', 'length'], ['err', 'res']);
exports.i2cStream = my.wrapCall(m, m.address, 'stream', ['command', 'length', 'delay'], []);
