// Modified by Aditya Patadia, Octal Consulting LLP
var fs = require('fs');
var debug = require('debug')('bone');

var gpioFile = {};

module.exports = {

    startWatchdog : function() {
        return true;
    },

    stopWatchdog : function() {
        return true;
    },

    readPWMFreqAndValue : function(pin, pwm) {
        debug('readPWMFreqAndValue(' + [pin.key, pwm.key] + ')');
        var mode = {};
        mode.freq = pwm.freq;
        mode.value = pwm.value;
        return(mode);
    },

    readGPIODirection : function(n, gpio) {
        debug('readGPIODirection(' + [n] + ')');
        var mode = {};
        if(typeof gpio[n] != 'undefined') {
            if(gpio[n].active) {
                mode.active = true;
            } else {
                mode.active = false;
            }
            mode.direction = gpio[n].direction;
        }
        return(mode);
    },

    readPinMux : function(pin, mode, callback) {
        debug('readPinMux(' + [pin.key] + ')');
        if(callback) {
            callback(mode);
        }
        return(mode);
    },

    setPinMode : function(pin, pinData, template, resp, callback) {
        debug('setPinMode(' + [pin.key, pinData, template] + ')');
        gpioFile[pin.key] = true;
        if(typeof callback == 'function'){
            callback({});
        }
        return(resp);
    },

    setLEDPinToGPIO : function(pin, resp) {
        debug('setLEDPinToGPIO(' + [pin.key] + ')');
        return(resp);
    },

    exportGPIOControls : function(pin, direction, resp, callback) {
        debug('expertGPIOControls(' + [pin.key, direction] + ')');
        if(typeof callback == 'function'){
            callback({});
        }
        return(resp);
    },

    writeGPIOValue : function(pin, value, callback) {
        debug('writeGPIOValue(' + [pin.key, value] + ')');
        if(callback) {
            setTimeout(callback,20);
        }
    },

    writeGPIOValueSync : function(pin, value) {
        debug('writeGPIOValueSync(' + [pin.key, value] + ')');
    },

    readGPIOValue : function(pin, resp, callback) {
        debug('readGPIOValue(' + [pin.key] + ')');
        if(callback) {
            setTimeout(callback,20,0);
            return(true);
        }
        resp.value = 0;
        return(resp);
    },

    enableAIN : function(callback) {
        debug('enableAIN()');
        if(typeof callback == 'function'){
            var resp = {};
            resp.err = false;
            callback(resp);
        }
        return(true);
    },

    readAIN : function(pin, resp, callback) {
        debug('readAIN(' + [pin.key] + ')');
        resp.value = 0;
        if(callback) {
            setTimeout(callback,20,resp);
        }
        return(resp);
    },

    writeGPIOEdge : function(pin, mode) {
        debug('writeGPIOEdge(' + [pin.key, mode] + ')');
        var resp = {};
        return(resp);
    },

    writePWMFreqAndValue : function(pin, pwm, freq, value, resp) {
        debug('writePWMFreqAndValue(' + [pin.key, pwm.name, freq, value] + ')');
        return(resp);
    },

    readEeproms : function(eeproms) {
        debug('readEeproms()');
        var boardName = 'A335BNLT';
        var version = '';
        var serialNumber = '';
        eeproms['/sys/bus/i2c/drivers/at24/1-0050/eeprom'] = {};
        eeproms['/sys/bus/i2c/drivers/at24/1-0050/eeprom'].boardName = boardName;
        eeproms['/sys/bus/i2c/drivers/at24/1-0050/eeprom'].version = version;
        eeproms['/sys/bus/i2c/drivers/at24/1-0050/eeprom'].serialNumber = serialNumber;
        return(eeproms);
    },

    readPlatform : function(platform) {
        debug('readPlatform()');
        platform.name = 'BeagleBone Simulator';
        return(platform);
    }
};
  