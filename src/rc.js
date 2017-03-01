// Copyright (C) 2017 - Texas Instruments, Jason Kridner
var my = require('./my');
var rc = my.require('roboticscape');

if(!rc.exists) return;

exports.rcInitialize = function(callback) {
    var i = rc.initialize();
    var x = {};
    if(i) {
        x.error = i;
    }
    if(callback) callback(x);
    return(i);
};
exports.rcInitialize.args = ['callback'];

exports.rcState = function(state, callback) {
    var x = {};
    if(state) {
        rc.state(state);
    } else {
        state = rc.state();
    }
    x.state = state;
    if(callback) callback(x);
    return(state);
};
exports.rcState.args = ['state', 'callback'];

exports.rcLED = function(led, value, callback) {
    if(typeof value !== 'undefined') {
        rc.led(led, value);
    }
    if(callback) callback();
};
exports.rcLED.args = ['led', 'value', 'callback'];

exports.rcOn = function(event, callback) {
    function myCallback() {
        callback({'event': event});
    }
    rc.on(event, myCallback);
};
exports.rcOn.args = ['event', 'callback'];

exports.rcMotor = function(motor, value, callback) {
    if(typeof motor !== 'undefined') {
        rc.motor(motor, value);
    } else {
        rc.motor(value);
    }
    if(callback) callback();
};
exports.rcMotor.args = ['motor', 'value', 'callback'];

exports.rcEncoder = function(encoder, value, callback) {
    var x = {};
    x.encoder = encoder;
    var i;
    if(typeof value !== 'undefined') {
        i = rc.encoder(encoder, value);
    } else {
        i = rc.encoder(encoder);
        x.value = i;
    }
    if(callback) callback(x);
};
exports.rcEncoder.args = ['encoder', 'value', 'callback'];
