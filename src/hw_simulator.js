var fs = require('fs');
var winston = require('winston');

var gpioFile = {};

var debug;
if(process.env.DEBUG && process.env.DEBUG.indexOf("bone")!==-1){
    debug = true;
} else {
    debug = false;
}

module.exports = {
    logfile : 'bonescript.log',

    readPWMFreqAndValue : function(pin, pwm) {
        if(debug) winston.info('readPWMFreqAndValue(' + [pin.key, pwm.key] + ')');
        var mode = {};
        mode.freq = pwm.freq;
        mode.value = pwm.value;
        return(mode);
    },

    readGPIODirection : function(n, gpio) {
        if(debug) winston.info('readGPIODirection(' + [n] + ')');
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
        if(debug) winston.info('readPinMux(' + [pin.key] + ')');
        if(callback) {
            callback(mode);
        }
        return(mode);
    },

    setPinMode : function(pin, pinData, template, resp, callback) {
        if(debug) winston.info('setPinMode(' + [pin.key, pinData, template] + ')');
        gpioFile[pin.key] = true;
        if(typeof callback == 'function'){
            callback({});
        }
        return(resp);
    },

    setLEDPinToGPIO : function(pin, resp) {
        if(debug) winston.info('setLEDPinToGPIO(' + [pin.key] + ')');
        return(resp);
    },

    exportGPIOControls : function(pin, direction, resp, callback) {
        if(debug) winston.info('expertGPIOControls(' + [pin.key, direction] + ')');
        if(typeof callback == 'function'){
            callback({});
        }
        return(resp);
    },

    writeGPIOValue : function(pin, value, callback) {
        if(debug) winston.info('writeGPIOValue(' + [pin.key, value] + ')');
        if(callback) {
            setImmediate(callback);
        }
    },

    writeGPIOValueSync : function(pin, value, callback) {
        if(debug) winston.info('writeGPIOValueSync(' + [pin.key, value] + ')');
        if(callback) {
            setImmediate(callback);
        }
    },

    readGPIOValue : function(pin, resp, callback) {
        if(debug) winston.info('readGPIOValue(' + [pin.key] + ')');
        if(callback) {
            setImmediate(callback,0);
            return(true);
        }
        resp.value = 0;
        return(resp);
    },

    enableAIN : function(callback) {
        if(debug) winston.info('enableAIN()');
        if(typeof callback == 'function'){
            var resp = {};
            resp.err = false;
            callback(resp);
        }
        return(true);
    },

    readAIN : function(pin, resp, callback) {
        if(debug) winston.info('readAIN(' + [pin.key] + ')');
        resp.value = 0;
        if(callback) {
            setImmediate(callback,resp);
        }
        return(resp);
    },

    writeGPIOEdge : function(pin, mode) {
        if(debug) winston.info('writeGPIOEdge(' + [pin.key, mode] + ')');
        var resp = {};
        return(resp);
    },

    writePWMFreqAndValue : function(pin, pwm, freq, value, resp) {
        if(debug) winston.info('writePWMFreqAndValue(' + [pin.key, pwm.name, freq, value] + ')');
        return(resp);
    },

    readEeproms : function(eeproms) {
        if(debug) winston.info('readEeproms()');
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
        if(debug) winston.info('readPlatform()');
        platform.name = 'BeagleBone Simulator';
        return(platform);
    }
};
  