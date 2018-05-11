// Copyright (C) 2017 - Texas Instruments, Jason Kridner
// exports not changed to module.exports
var my = require('./my');
var rc = my.require('roboticscape');

if (!rc.exists) return;

rcInitialize = function (callback) {
    var i = rc.initialize();
    var x = {};
    if (i) {
        x.error = i;
    }
    if (callback) callback(x);
    return (i);
};
rcInitialize.args = ['callback'];

rcState = function (state, callback) {
    var x = {};
    if (state) {
        rc.state(state);
    } else {
        state = rc.state();
    }
    x.state = state;
    if (callback) callback(x);
    return (state);
};
rcState.args = ['state', 'callback'];

rcLED = function (led, value, callback) {
    if (typeof value !== 'undefined') {
        rc.led(led, value);
    }
    if (callback) callback();
};
rcLED.args = ['led', 'value', 'callback'];

rcOn = function (event, callback) {
    function myCallback() {
        callback({
            'event': event
        });
    }
    rc.on(event, myCallback);
};
rcOn.args = ['event', 'callback'];

rcMotor = function (motor, value, callback) {
    if (typeof motor !== 'undefined') {
        rc.motor(motor, value);
    } else {
        rc.motor(value);
    }
    if (callback) callback();
};
rcMotor.args = ['motor', 'value', 'callback'];

rcEncoder = function (encoder, value, callback) {
    var x = {};
    x.encoder = encoder;
    var i;
    if (typeof value !== 'undefined') {
        i = rc.encoder(encoder, value);
    } else {
        i = rc.encoder(encoder);
        x.value = i;
    }
    if (callback) callback(x);
};
rcEncoder.args = ['encoder', 'value', 'callback'];

module.exports = {
    rcInitialize: rcInitialize,
    rcState: rcState,
    rcLED: rcLED,
    rcOn: rcOn,
    rcMotor: rcMotor,
    rcEncoder: rcEncoder
}