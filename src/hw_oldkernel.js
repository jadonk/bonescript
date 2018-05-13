// Used for 3.2 kernel using /sys/kernel/debug/omap_mux/

var fs = require('fs');
var my = require('./my');
var parse = require('./parse');
var eeprom = require('./eeprom');
var hw_capemgr = require('./hw_capemgr');
var winston = require('winston');

var debug = true;

var gpioFile = {};
var pwmPrefix = {};

var logfile = '/var/lib/cloud9/bonescript.log';

var readPWMFreqAndValue = function (pin, pwm) {
    var mode = {};
    try {
        var duty_percent = fs.readFileSync(pwmPrefix[pin.pwm.name] + '/duty_percent');
        mode.freq = fs.readFileSync(pwmPrefix[pin.pwm.name] + '/period_freq');
        mode.value = duty_percent / 100.0;
    } catch (ex) {
        mode.err = 'cannot set PWM frequency and value: ' + ex;
    }
    return (mode);
};

var readGPIODirection = hw_capemgr.readGPIODirection;

var readPinMux = function (pin, mode, callback) {
    var muxFile = '/sys/kernel/debug/omap_mux/' + pin.mux;
    var readOmapMux = function (err, data) {
        if (err) {
            mode.err = 'readOmapMux error: ' + err;
            if (debug) winston.debug(mode.err);
            callback(mode);
        }
        mode = parse.modeFromOmapMux(data, mode);
        callback(mode);
    };
    var tryOmapMux = function (exists) {
        if (exists) {
            fs.readFile(muxFile, 'utf8', readOmapMux);
        }
    };
    if (callback) {
        my.file_exists(muxFile, tryOmapMux);
    } else {
        try {
            var data = fs.readFileSync(muxFile, 'utf8');
            mode = parse.modeFromOmapMux(data, mode);
        } catch (ex) {
            if (debug) winston.debug('getPinMode(' + pin.key + '): ' + ex);
        }
    }
    return (mode);
};

var setPinMode = function (pin, pinData, template, resp) {
    var muxFile = '/sys/kernel/debug/omap_mux/' + pin.mux;
    var n = pin.gpio;

    try {
        var fd = fs.openSync(muxFile, 'w');
        fs.writeSync(fd, pinData.toString(16), null);
    } catch (ex) {
        resp.err = 'Error writing to ' + muxFile + ': ' + ex;
        return (resp);
    }

    if (template == 'bspm') {
        gpioFile[pin.key] = '/sys/class/gpio/gpio' + pin.gpio + '/value';
        if (pin.led) {
            gpioFile[pin.key] = '/sys/class/leds/beaglebone::' + pin.led + '/brightness';
        }
    } else if (template == 'bspwm') {
        resp.path = '/sys/class/pwm/' + pin.pwm.path;
        var path = resp.path;
        pwmPrefix[pin.pwm.name] = path;

        // Clear up any unmanaged usage
        fs.writeFileSync(path + '/request', '0');

        // Allocate and configure the PWM
        fs.writeFileSync(path + '/request', '1');
        fs.writeFileSync(path + '/period_freq', '0');
        fs.writeFileSync(path + '/polarity', '0');
        fs.writeFileSync(path + '/run', '1');
    }
    return (resp);
};

var setLEDPinToGPIO = function (pin, resp) {
    var path = "/sys/class/leds/beaglebone::" + pin.led + "/trigger";

    if (my.file_existsSync(path)) {
        fs.writeFileSync(path, "gpio");
    } else {
        resp.err = "Unable to find LED: " + pin.led;
        winston.error(resp.err);
        resp.value = false;
    }

    return (resp);
};

var exportGPIOControls = hw_capemgr.exportGPIOControls;

var writeGPIOValue = function (pin, value, callback) {
    if (typeof gpioFile[pin.key] == 'undefined') {
        gpioFile[pin.key] = '/sys/class/gpio/gpio' + pin.gpio + '/value';
        if (pin.led) {
            gpioFile[pin.key] = "/sys/class/leds/beaglebone:";
            gpioFile[pin.key] += ":" + pin.led + "/brightness";
        }
        if (!my.file_existsSync(gpioFile[pin.key])) {
            winston.error("Unable to find gpio: " + gpioFile[pin.key]);
        }
    }
    if (debug) winston.debug("gpioFile = " + gpioFile[pin.key]);
    if (callback) {
        fs.writeFile(gpioFile[pin.key], '' + value, null, callback);
    } else {
        try {
            fs.writeFileSync(gpioFile[pin.key], '' + value, null);
        } catch (ex) {
            winston.error("Unable to write to " + gpioFile[pin.key]);
        }
    }
};

var readGPIOValue = hw_capemgr.readGPIOValue;

var enableAIN = function () {
    return (true);
};

var readAIN = function (pin, resp, callback) {
    var ainFile = '/sys/bus/platform/devices/tsc/ain' + (pin.ain + 1).toString();
    if (callback) {
        var readFile = function (err, data) {
            if (err) {
                resp.err = 'analogRead error: ' + err;
                winston.error(resp.err);
            }
            resp.value = parseInt(data, 10) / 4096;
            callback(resp);
        };
        fs.readFile(ainFile, readFile);
        return (resp);
    }
    resp.value = parseInt(fs.readFileSync(ainFile), 10);
    if (isNaN(resp.value)) {
        resp.err = 'analogRead(' + pin.key + ') returned ' + resp.value;
        winston.error(resp.err);
    }
    resp.value = resp.value / 4096;
    if (isNaN(resp.value)) {
        resp.err = 'analogRead(' + pin.key + ') scaled to ' + resp.value;
    }
    return (resp);
};

var writeGPIOEdge = hw_capemgr.writeGPIOEdge;

var writePWMFreqAndValue = function (pin, pwm, freq, value, resp) {
    var path = pwmPrefix[pin.pwm.name];
    if (pwm.freq != freq) {
        fs.writeFileSync(path + '/run', '0');
        fs.writeFileSync(path + '/duty_percent', '0');
        fs.writeFileSync(path + '/period_freq', Math.round(freq));
        fs.writeFileSync(path + '/run', '1');
    }
    fs.writeFileSync(path + '/duty_percent', Math.round(value * 100));
    return (resp);
};

var readEeproms = function (eeproms) {
    var EepromFiles = {
        '/sys/bus/i2c/drivers/at24/1-0050/eeprom': {
            type: 'bone'
        },
        '/sys/bus/i2c/drivers/at24/3-0054/eeprom': {
            type: 'cape'
        },
        '/sys/bus/i2c/drivers/at24/3-0055/eeprom': {
            type: 'cape'
        },
        '/sys/bus/i2c/drivers/at24/3-0056/eeprom': {
            type: 'cape'
        },
        '/sys/bus/i2c/drivers/at24/3-0057/eeprom': {
            type: 'cape'
        }
    };
    eeproms = eeprom.readEeproms(EepromFiles);
    return (eeproms);
};

var readPlatform = function (platform) {
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