// Copyright (C) 2017 - Texas Instruments, Jason Kridner
var my = require('./my');
var rc = my.require('roboticscape');

if (rc.exists) {

    var rcInitialize = function (callback) {
        var i = rc.initialize();
        var x = {};
        if (i) {
            x.error = i;
        }
        if (callback) callback(x);
        return (i);
    };
    rcInitialize.args = ['callback'];

    var rcState = function (state, callback) {
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

    var rcLED = function (led, value, callback) {
        if (typeof value !== 'undefined') {
            rc.led(led, value);
        }
        if (callback) callback();
    };
    rcLED.args = ['led', 'value', 'callback'];

    var rcOn = function (event, callback) {
        function myCallback() {
            callback({
                'event': event
            });
        }
        rc.on(event, myCallback);
    };
    rcOn.args = ['event', 'callback'];

    var rcMotor = function (motor, value, callback) {
        if (typeof value !== 'undefined') {
            rc.motor(motor, value);
        } else {
            rc.motor(motor);
        }
        if (callback) callback();
    };
    rcMotor.args = ['motor', 'value', 'callback'];

    var rcServo = function (option, value, callback) {
        if (typeof value !== 'undefined') {
            rc.servo(option, value);
        } else {
            rc.servo(option);
        }
        if (callback) callback();
    };
    rcServo.args = ['option', 'value', 'callback'];

    var rcBMP = function (option, callback) {
        var value
        if (typeof option !== 'undefined') {
            value = rc.bmp(option);
        }
        if (callback) callback(null, value);
        else return value;
    };
    rcBMP.args = ['option', 'callback'];

    var rcIMU = function (option, callback) {
        var value
        if (typeof option !== 'undefined') {
            value = rc.imu(option);
        }
        if (callback) callback(null, value);
        else return value;
    };
    rcIMU.args = ['option', 'callback'];

    var rcEncoder = function (encoder, value, callback) {
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
        rcServo: rcServo,
        rcBMP: rcBMP,
        rcIMU: rcIMU,
        rcEncoder: rcEncoder
    };
}