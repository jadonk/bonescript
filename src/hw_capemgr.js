var fs = require('fs');
var winston = require('winston');
var my = require('./my');
var parse = require('./parse');

var debug = process.env.DEBUG ? true : false;

var gpioFile = {};
var pwmPrefix = {};
var ainPrefix = "";

var logfile = '/var/lib/cloud9/bonescript.log';

var readPWMFreqAndValue = function (pin, pwm) {
    var mode = {};
    try {
        var period = fs.readFileSync(pwmPrefix[pin.pwm.name] + '/period');
        var duty = fs.readFileSync(pwmPrefix[pin.pwm.name] + '/duty');
        mode.freq = 1.0e9 / period;
        mode.value = duty / period;
    } catch (ex) {}
    return (mode);
};

var readGPIODirection = function (n, gpio) {
    var mode = {};
    var directionFile = "/sys/class/gpio/gpio" + n + "/direction";
    if (my.file_existsSync(directionFile)) {
        mode.active = true;
        var direction = fs.readFileSync(directionFile, 'utf-8');
        direction = direction.replace(/^\s+|\s+$/g, '');
        mode.direction = direction;
    }
    return (mode);
};

var readPinMux = function (pin, mode, callback) {
    var pinctrlFile = '/sys/kernel/debug/pinctrl/44e10800.pinmux/pins';
    var muxRegOffset = parseInt(pin.muxRegOffset, 16);
    var readPinctrl = function (err, data) {
        if (err) {
            mode.err = 'readPinctrl error: ' + err;
            if (debug) winston.debug(mode.err);
            callback(mode);
        }
        mode = parse.modeFromPinctrl(data, muxRegOffset, 0x44e10800, mode);
        callback(mode);
    };
    var tryPinctrl = function (exists) {
        if (exists) {
            fs.readFile(pinctrlFile, 'utf8', readPinctrl);
        } else {
            if (debug) winston.debug('getPinMode(' + pin.key + '): no valid mux data');
            callback(mode);
        }
    };
    if (callback) {
        my.file_exists(pinctrlFile, tryPinctrl);
    } else {
        try {
            var data2 = fs.readFileSync(pinctrlFile, 'utf8');
            mode = parse.modeFromPinctrl(data2, muxRegOffset, 0x44e10800, mode);
        } catch (ex) {
            if (debug) winston.debug('getPinMode(' + pin.key + '): ' + ex);
        }
    }
    return (mode);
};

var setPinMode = function (pin, pinData, template, resp, callback) {
    if (debug) winston.debug('hw.setPinMode(' + [pin.key, pinData, template, JSON.stringify(resp)] + ');');
    if (debug) winston.debug('typeof callack = ' + typeof callback);
    if (template == 'bspm') {
        gpioFile[pin.key] = '/sys/class/gpio/gpio' + pin.gpio + '/value';
        if (callback) {
            doCreateDT(resp);
            return (resp);
        }
        if (pin.led) {
            gpioFile[pin.key] = '/sys/class/leds/beaglebone::' + pin.led + '/brightness';
        }
    } else if (template == 'bspwm') {
        if (callback) {
            my.load_dt('am33xx_pwm', null, resp, doCreateDT);
            return (resp);
        }
        if (!my.load_dt('am33xx_pwm')) {
            resp.err = 'Error loading am33xx_pwm devicetree overlay';
            return (resp);
        }
    } else {
        resp.err = 'Unknown pin mode template';
        if (callback) {
            callback(resp);
            return (resp);
        }
    }

    // only synchronous stuff at this point

    if (!my.create_dt(pin, pinData, template)) {
        resp.err = 'Error loading devicetree overlay for ' + pin.key + ' using template ' + template;
        return (resp);
    }
    if (template == 'bspwm') {
        try {
            var ocp = my.is_ocp();
            var p = 'bs_pwm_test_' + pin.key;
            var pwm_test = my.find_sysfsFile(p, ocp, p + '.');
            pwmPrefix[pin.pwm.name] = pwm_test;
            fs.writeFileSync(pwm_test + '/polarity', 0);
        } catch (ex) {
            resp.err = 'Error enabling PWM controls: ' + ex;
            winston.error(resp.err);
        }
    }

    // now to define the asynchronous calls

    function doCreateDT(resp) {
        if (resp.err) {
            callback(resp);
            return;
        }
        my.create_dt(pin, pinData, template, true, false, resp, onCreateDT);
    }

    function onCreateDT(resp) {
        if (resp.err) {
            callback(resp);
            return;
        }
        if (template == 'bspwm') {
            my.file_find('/sys/devices', 'ocp.', 1, onFindOCP);
        } else {
            callback(resp);
        }

        function onFindOCP(ocp) {
            if (ocp.err) {
                resp.err = "Error searching for ocp: " + ocp.err;
                if (debug) winston.debug(resp.err);
                callback(resp);
                return;
            }
            my.file_find(ocp.path, 'bs_pwm_test_' + pin.key + '.', 1, onFindPWM);
        }

        function onFindPWM(pwm_test) {
            if (pwm_test.err) {
                resp.err = "Error searching for pwm_test: " + pwm_test.err;
                if (debug) winston.debug(resp.err);
                callback(resp);
                return;
            }
            my.file_find(pwm_test.path, 'period', 1, onFindPeriod);

            function onFindPeriod(period) {
                if (period.err) {
                    resp.err = "Error searching for period: " + period.err;
                    if (debug) winston.debug(resp.err);
                    callback(resp);
                    return;
                }
                pwmPrefix[pin.pwm.name] = pwm_test.path;
                fs.writeFile(pwm_test.path + '/polarity', 0, 'ascii', onPolarityWrite);
            }
        }

        function onPolarityWrite(err) {
            if (err) {
                resp.err = "Error writing PWM polarity: " + err;
                if (debug) winston.debug(resp.err);
            }
            callback(resp);
        }
    }

    return (resp);
};

var setLEDPinToGPIO = function (pin, resp) {
    var path = "/sys/class/leds/beaglebone:green:" + pin.led + "/trigger";

    if (my.file_existsSync(path)) {
        fs.writeFileSync(path, "gpio");
    } else {
        resp.err = "Unable to find LED " + pin.led;
        winston.error(resp.err);
        resp.value = false;
    }

    return (resp);
};

var exportGPIOControls = function (pin, direction, resp, callback) {
    if (debug) winston.debug('hw.exportGPIOControls(' + [pin.key, direction, resp] + ');');
    var n = pin.gpio;
    if (callback) {
        my.file_exists(gpioFile[pin.key], onFileExists);
        return;
    }
    var exists = my.file_existsSync(gpioFile[pin.key]);
    if (exists) {
        if (debug) winston.debug("gpio: " + n + " already exported.");
        fs.writeFileSync("/sys/class/gpio/gpio" + n + "/direction",
            direction, null);
    } else {
        try {
            if (debug) winston.debug("exporting gpio: " + n);
            fs.writeFileSync("/sys/class/gpio/export", "" + n, null);
            if (debug) winston.debug("setting gpio " + n +
                " direction to " + direction);
            fs.writeFileSync("/sys/class/gpio/gpio" + n + "/direction",
                direction, null);
        } catch (ex2) {
            resp.value = false;
            resp.err = 'Unable to export gpio-' + n + ': ' + ex2;
            if (debug) winston.debug(resp.err);
            var gpioUsers =
                fs.readFileSync('/sys/kernel/debug/gpio', 'utf-8');
            gpioUsers = gpioUsers.split('\n');
        }
    }

    function onFileExists(exists) {
        if (exists) {
            if (debug) winston.debug("gpio: " + n + " already exported.");
            fs.writeFile("/sys/class/gpio/gpio" + n + "/direction",
                direction, null, onGPIODirectionSet);
        } else {
            if (debug) winston.debug("exporting gpio: " + n);
            fs.writeFile("/sys/class/gpio/export", "" + n, null, onGPIOExport);
        }
    }

    function onGPIOExport(err) {
        if (err) onError(err);
        if (debug) winston.debug("setting gpio " + n +
            " direction to " + direction);
        fs.writeFile("/sys/class/gpio/gpio" + n + "/direction",
            direction, null, onGPIODirectionSet);
    }

    function onGPIODirectionSet(err) {
        if (err) onError(err);
        else callback(resp);
    }

    function onError(err) {
        resp.err = 'Unable to export gpio-' + n + ': ' + err;
        resp.value = false;
        if (debug) winston.debug(resp.err);
        findOwner();
    }

    function findOwner() {
        fs.readFile('/sys/kernel/debug/gpio', 'utf-8', onGPIOUsers);
    }

    function onGPIOUsers(err, data) {
        if (!err) {
            var gpioUsers = data.split('\n');
            for (var x in gpioUsers) {
                var y = gpioUsers[x].match(/gpio-(\d+)\s+\((\S+)\s*\)/);
                if (y && y[1] == n) {
                    resp.err += '\nconsumed by ' + y[2];
                    if (debug) winston.debug(resp.err);
                }
            }
        }
        callback(resp);
    }

    return (resp);
};

var writeGPIOValue = function (pin, value, callback) {
    if (typeof gpioFile[pin.key] == 'undefined') {
        gpioFile[pin.key] = '/sys/class/gpio/gpio' + pin.gpio + '/value';
        if (pin.led) {
            gpioFile[pin.key] = "/sys/class/leds/beaglebone:";
            gpioFile[pin.key] += "green:" + pin.led + "/brightness";
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

var readGPIOValue = function (pin, resp, callback) {
    var gpioFile = '/sys/class/gpio/gpio' + pin.gpio + '/value';
    if (callback) {
        var readFile = function (err, data) {
            if (err) {
                resp.err = 'digitalRead error: ' + err;
                winston.error(resp.err);
            }
            resp.value = parseInt(data, 2);
            callback(resp);
        };
        fs.readFile(gpioFile, readFile);
        return (true);
    }
    resp.value = parseInt(fs.readFileSync(gpioFile), 2);
    return (resp);
};

var enableAIN = function (callback) {
    var helper = "";
    if (my.load_dt('cape-bone-iio')) {
        var ocp = my.is_ocp();
        if (ocp) {
            helper = my.find_sysfsFile('helper', ocp, 'helper.');
            if (helper) {
                ainPrefix = helper + '/AIN';
            }
        }
    }
    if (callback) {
        callback({
            'path': helper
        })
    }
    return (helper.length > 1);
};

var readAIN = function (pin, resp, callback) {
    var ainFile = ainPrefix + pin.ain.toString();
    if (callback) {
        var readFile = function (err, data) {
            if (err) {
                resp.err = 'analogRead error: ' + err;
                winston.error(resp.err);
            }
            resp.value = parseInt(data, 10) / 1800;
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
    resp.value = resp.value / 1800;
    if (isNaN(resp.value)) {
        resp.err = 'analogRead(' + pin.key + ') scaled to ' + resp.value;
        winston.error(resp.err);
    }
    return (resp);
};

var writeGPIOEdge = function (pin, mode) {
    fs.writeFileSync('/sys/class/gpio/gpio' + pin.gpio + '/edge', mode);

    var resp = {};
    resp.gpioFile = '/sys/class/gpio/gpio' + pin.gpio + '/value';
    resp.valuefd = fs.openSync(resp.gpioFile, 'r');
    resp.value = new Buffer(1);

    return (resp);
};

var writePWMFreqAndValue = function (pin, pwm, freq, value, resp, callback) {
    if (debug) winston.debug('hw.writePWMFreqAndValue(' + [pin.key, pwm, freq, value, resp] + ');');
    var path = pwmPrefix[pin.pwm.name];
    try {
        var period = Math.round(1.0e9 / freq); // period in ns
        var duty = Math.round(period * value);
        fs.writeFileSync(path + '/duty', 0);
        if (pwm.freq != freq) {
            if (debug) winston.debug('Updating PWM period: ' + period);
            fs.writeFileSync(path + '/period', period);
        }
        if (debug) winston.debug('Updating PWM duty: ' + duty);
        fs.writeFileSync(path + '/duty', duty);
    } catch (ex) {
        resp.err = 'error updating PWM freq and value: ' + path + ', ' + ex;
        winston.error(resp.err);
    }
    return (resp);
};

var readEeproms = function (eeproms) {
    var boardName = fs.readFileSync(my.is_capemgr() + '/baseboard/board-name',
        'ascii');
    var version = fs.readFileSync(my.is_capemgr() + '/baseboard/revision',
        'ascii');
    var serialNumber = fs.readFileSync(my.is_capemgr() + '/baseboard/serial-number',
        'ascii');
    eeproms['/sys/bus/i2c/drivers/at24/1-0050/eeprom'] = {};
    eeproms['/sys/bus/i2c/drivers/at24/1-0050/eeprom'].boardName = boardName;
    eeproms['/sys/bus/i2c/drivers/at24/1-0050/eeprom'].version = version;
    eeproms['/sys/bus/i2c/drivers/at24/1-0050/eeprom'].serialNumber = serialNumber;
    return (eeproms);
};

var readPlatform = function (platform) {
    platform.name = fs.readFileSync(my.is_capemgr() + '/baseboard/board-name',
        'ascii').trim();
    if (platform.name == 'A335BONE') platform.name = 'BeagleBone';
    if (platform.name == 'A335BNLT') platform.name = 'BeagleBone Black';
    if (platform.name == 'A335PBGL') platform.name = 'PocketBeagle';
    platform.version = fs.readFileSync(my.is_capemgr() + '/baseboard/revision',
        'ascii').trim();
    if (platform.version[0] == 0x1A) {
        platform.version = '1A';
        platform.name = 'BeagleBone Green';
    } else if (platform.version.match(/^GR/)) {
        platform.version = platform.version.substr(2);
        platform.name = 'BeagleBone Green';
    } else if (platform.version.match(/^BL/)) {
        platform.version = platform.version.substr(2);
        platform.name = 'BeagleBone Blue';
    } else if (!platform.version.match(/^[\040-\176]*$/)) delete platform.version;
    platform.serialNumber = fs.readFileSync(my.is_capemgr() +
        '/baseboard/serial-number', 'ascii').trim();
    if (!platform.serialNumber.match(/^[\040-\176]*$/)) delete platform.serialNumber;
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
    readPlatform: readPlatform,
}