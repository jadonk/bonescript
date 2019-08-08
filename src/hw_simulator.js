var fs = require('fs');
var winston = require('winston');

var gpioFile = {};

var logfile = 'bonescript.log';
var readPWMFreqAndValue = function (pin, pwm) {
    winston.info('readPWMFreqAndValue(' + [pin.key, pwm.key] + ')');
    var mode = {};
    mode.freq = pwm.freq;
    mode.value = pwm.value;
    return (mode);
};

var readGPIODirection = function (n, gpio) {
    winston.info('readGPIODirection(' + [n] + ')');
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
};

var readPinMux = function (pin, mode, callback) {
    winston.info('readPinMux(' + [pin.key] + ')');
    if (callback) {
        if (callback.length == 1)
            callback(mode);
        else
            callback(null, mode);
    }
    return (mode);
};

var setPinMode = function (pin, pinData, template, resp) {
    winston.info('setPinMode(' + [pin.key, pinData, template] + ')');
    gpioFile[pin.key] = true;
    return (resp);
};

var setLEDPinToGPIO = function (pin, resp) {
    winston.info('setLEDPinToGPIO(' + [pin.key] + ')');
    return (resp);
};

var exportGPIOControls = function (pin, direction, resp) {
    winston.info('expertGPIOControls(' + [pin.key, direction] + ')');
    return (resp);
};

var writeGPIOValue = function (pin, value, callback) {
    winston.info('writeGPIOValue(' + [pin.key, value] + ')');
    if (callback) {
        callback();
    }
};

var readGPIOValue = function (pin, resp, callback) {
    winston.info('readGPIOValue(' + [pin.key] + ')');
    if (callback) {
        resp.value = 0;
        if (callback.length == 1)
            callback(resp);
        else
            callback(null, resp.value);
        return (true);
    }
    resp.value = 0;
    return (resp);
};

var enableAIN = function () {
    winston.info('enableAIN()');
    return (true);
};

var readAIN = function (pin, resp, callback) {
    winston.info('readAIN(' + [pin.key] + ')');
    resp.value = 0;
    if (callback) {
        if (callback.length == 1)
            callback(resp);
        else
            callback(null, resp.value);
    }
    return (resp);
};

var writeGPIOEdge = function (pin, mode) {
    winston.info('writeGPIOEdge(' + [pin.key, mode] + ')');
    var resp = {};
    return (resp);
};

var writePWMFreqAndValue = function (pin, pwm, freq, value, resp) {
    winston.info('writePWMFreqAndValue(' + [pin.key, pwm.name, freq, value] + ')');
    return (resp);
};

var readEeproms = function (eeproms) {
    winston.info('readEeproms()');
    var boardName = 'A335BNLT';
    var version = '';
    var serialNumber = '';
    eeproms['/sys/bus/i2c/drivers/at24/1-0050/eeprom'] = {};
    eeproms['/sys/bus/i2c/drivers/at24/1-0050/eeprom'].boardName = boardName;
    eeproms['/sys/bus/i2c/drivers/at24/1-0050/eeprom'].version = version;
    eeproms['/sys/bus/i2c/drivers/at24/1-0050/eeprom'].serialNumber = serialNumber;
    return (eeproms);
};

var readPlatform = function (platform) {
    winston.info('readPlatform()');
    platform.name = 'BeagleBone Simulator';
    return (platform);
};

module.exports = {
    logfile: logfile,
    readPWMFreqAndValue: readPWMFreqAndValue,
    readGPIODirection: readGPIODirection,
    readPinMux: readPinMux,
    setPinMode: setPinMode,
    setLEDPinToGPIO: setLEDPinToGPIO,
    exportGPIOControls: exportGPIOControls,
    writeGPIOValue: writeGPIOValue,
    readGPIOValue: readGPIOValue,
    enableAIN: enableAIN,
    readAIN: readAIN,
    writeGPIOEdge: writeGPIOEdge,
    writePWMFreqAndValue: writePWMFreqAndValue,
    readEeproms: readEeproms,
    readPlatform: readPlatform
}