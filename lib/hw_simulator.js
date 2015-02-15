// Modified by Aditya Patadia, Octal Consulting LLP
var fs = require('fs');
var debug = require('debug')('bone');

var gpioFile = {};

module.exports = {

    watchdog: {
        start: function() {
            return true;
        },

        stop: function() {
            return true;
        }
    },

    pwm: {
        readFreqAndValue: function(pin, pwm) {
            debug('pwm.readFreqAndValue(' + [pin.key, pwm.key] + ')');
            var mode = {};
            mode.freq = pwm.freq;
            mode.value = pwm.value;
            return (mode);
        },

        enable: function(callback) {
            debug('enableAIN()');
            if (typeof callback == 'function') {
                var resp = {};
                resp.err = false;
                callback(resp);
            }
            return (true);
        },

        readInput: function(pin, resp, callback) {
            debug('readAIN(' + [pin.key] + ')');
            resp.value = 0;
            if (callback) {
                setTimeout(callback, 20, resp);
            }
            return (resp);
        },

        writeFreqAndValue: function(pin, pwm, freq, value, resp) {
            debug('writePWMFreqAndValue(' + [pin.key, pwm.name, freq, value] + ')');
            return (resp);
        },
    },

    digital: {
        readDirection: function(n, gpio) {
            debug('readGPIODirection(' + [n] + ')');
            var mode = {};
            if (typeof gpio[n] != 'undefined') {
                if (gpio[n].active) {
                    mode.active = true;
                } else {
                    mode.active = false;
                }
                mode.direction = gpio[n].direction;
            }
            return (mode);
        },

        setLEDPinToGPIO: function(pin, resp) {
            debug('setLEDPinToGPIO(' + [pin.key] + ')');
            return (resp);
        },

        exportControls: function(pin, direction, resp, callback) {
            debug('expertGPIOControls(' + [pin.key, direction] + ')');
            if (typeof callback == 'function') {
                callback({});
            }
            return (resp);
        },

        write: function(pin, value, callback) {
            debug('writeGPIOValue(' + [pin.key, value] + ')');
            if (callback) {
                setTimeout(callback, 20);
            }
        },

        writeSync: function(pin, value) {
            debug('writeGPIOValueSync(' + [pin.key, value] + ')');
        },

        read: function(pin, resp, callback) {
            debug('readGPIOValue(' + [pin.key] + ')');
            if (callback) {
                setTimeout(callback, 20, 0);
                return (true);
            }
            resp.value = 0;
            return (resp);
        },

        writeEdge: function(pin, mode) {
            debug('writeGPIOEdge(' + [pin.key, mode] + ')');
            var resp = {};
            return (resp);
        },
    },



    setPinMode: function(pin, pinData, template, resp, callback) {
        debug('setPinMode(' + [pin.key, pinData, template] + ')');
        gpioFile[pin.key] = true;
        if (typeof callback == 'function') {
            callback({});
        }
        return (resp);
    },

    readEeproms: function(eeproms) {
        debug('readEeproms()');
        var boardName = 'A335BNLT';
        var version = '';
        var serialNumber = '';
        eeproms['/sys/bus/i2c/drivers/at24/1-0050/eeprom'] = {};
        eeproms['/sys/bus/i2c/drivers/at24/1-0050/eeprom'].boardName = boardName;
        eeproms['/sys/bus/i2c/drivers/at24/1-0050/eeprom'].version = version;
        eeproms['/sys/bus/i2c/drivers/at24/1-0050/eeprom'].serialNumber = serialNumber;
        return (eeproms);
    },

    readPlatform: function(platform) {
        debug('readPlatform()');
        platform.name = 'BeagleBone Simulator';
        return (platform);
    }
};