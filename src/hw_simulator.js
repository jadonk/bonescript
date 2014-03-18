var fs = require('fs');
var winston = require('winston');
var bone = require('./bone.js');

var jsonFile = process.env.JSON_FILE;

var gpioFile = {};
var pins = bone.pins;

jsonFileUpdate();

function jsonFileUpdate() {
    if(jsonFile) {
        fs.writeFile(jsonFile, JSON.stringify(pins, null, 4), 'ascii');
    }
}

exports.logfile = 'bonescript.log';
exports.readPWMFreqAndValue = function(pin, pwm) {
    winston.info('readPWMFreqAndValue(' + [pin.key, pwm.key] + ')');
    var mode = {};
    mode.freq = pwm.freq;
    mode.value = pwm.value;
    if(jsonFile) {
        pins[pin.key].mode = mode;
        jsonFileUpdate();
    }
    return(mode);
};

exports.readGPIODirection = function(n, gpio, pin) {
    winston.info('readGPIODirection(' + [n] + ')');
    var mode = {};
    if(typeof gpio[n] != 'undefined') {
        if(gpio[n].active) {
            mode.active = true;
        } else {
            mode.active = false;
        }
        mode.direction = gpio[n].direction;
    }
    if(jsonFile) {
        pins[pin.key].mode = mode;
        jsonFileUpdate();
    }
    return(mode);
};

exports.readPinMux = function(pin, mode, callback) {
    winston.info('readPinMux(' + [pin.key] + ')');
    if(jsonFile) {
        mode = (typeof pins[pin.key].mode == 'undefined') ? {} : pins[pin.key].mode;
    }
    if(callback) {
        callback(mode);
    }
    return(mode);
};

exports.setPinMode = function(pin, pinData, template, resp) {
    winston.info('setPinMode(' + [pin.key, pinData, template] + ')');
    gpioFile[pin.key] = true;
    if(jsonFile) {
        var mode = (typeof pins[pin.key].mode == 'undefined') ? {} : pins[pin.key].mode;
        mode.pinData = pinData;
        pins[pin.key].mode = mode;
        jsonFileUpdate();
    }
    return(resp);
};

exports.setLEDPinToGPIO = function(pin, resp) {
    winston.info('setLEDPinToGPIO(' + [pin.key] + ')');
    return(resp);
};

exports.exportGPIOControls = function(pin, direction, resp) {
    winston.info('expertGPIOControls(' + [pin.key, direction] + ')');
    if(jsonFile) {
        var mode = (typeof pins[pin.key].mode == 'undefined') ? {} : pins[pin.key].mode;
        mode.direction = direction;
        pins[pin.key].mode = mode;
        jsonFileUpdate();
    }
    return(resp);
};

exports.writeGPIOValue = function(pin, value, callback) {
    winston.info('writeGPIOValue(' + [pin.key, value] + ')');
    if(jsonFile) {
        var mode = (typeof pins[pin.key].mode == 'undefined') ? {} : pins[pin.key].mode;
        mode.value = value;
        pins[pin.key].mode = mode;
        jsonFileUpdate();
    }
    if(callback) {
        callback();
    }
};

exports.readGPIOValue = function(pin, resp, callback) {
    winston.info('readGPIOValue(' + [pin.key] + ')');
    if(jsonFile) {
        var mode = (typeof pins[pin.key].mode == 'undefined') ? {} : pins[pin.key].mode;
        mode.value = value;
        pins[pin.key].mode = mode;
        jsonFileUpdate();
    }
    if(callback) {
        callback(0);
        return(true);
    }
    resp.value = 0;
    return(resp);
};

exports.enableAIN = function() {
    winston.info('enableAIN()');
    return(true);
};

exports.readAIN = function(pin, resp, callback) {
    winston.info('readAIN(' + [pin.key] + ')');
    resp.value = 0;
    if(callback) {
        callback(resp);
    }
    return(resp);
};

exports.writeGPIOEdge = function(pin, mode) {
    winston.info('writeGPIOEdge(' + [pin.key, mode] + ')');
    var resp = {};
    return(resp);
};

exports.writePWMFreqAndValue = function(pin, pwm, freq, value, resp) {
    winston.info('writePWMFreqAndValue(' + [pin.key, pwm.name, freq, value] + ')');
    return(resp);
};

exports.readEeproms = function(eeproms) {
    winston.info('readEeproms()');
    var boardName = 'A335BNLT';
    var version = '';
    var serialNumber = '';
    eeproms['/sys/bus/i2c/drivers/at24/1-0050/eeprom'] = {};
    eeproms['/sys/bus/i2c/drivers/at24/1-0050/eeprom'].boardName = boardName;
    eeproms['/sys/bus/i2c/drivers/at24/1-0050/eeprom'].version = version;
    eeproms['/sys/bus/i2c/drivers/at24/1-0050/eeprom'].serialNumber = serialNumber;
    return(eeproms);
};

exports.readPlatform = function(platform) {
    winston.info('readPlatform()');
    platform.name = 'BeagleBone Simulator';
    return(platform);
};
