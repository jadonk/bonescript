var fs = require('fs');
var my = require('./my');
var parse = require('./parse');
var eeprom = require('./eeprom');
var util = require('util');
var winston = require('winston');

var debug = process.env.DEBUG ? true : false;
if (debug) {
    winston.remove(winston.transports.Console);
    winston.add(winston.transports.Console, {
        colorize: true
    });
}

var gpioFile = {};
var pwmPrefix = {};
var ainPrefix = "/sys/bus/iio/devices/iio:device0";
var SLOTS = "/sys/devices/platform/bone_capemgr/slots";
var AINdts = "BB-ADC";

module.exports = {
    logfile: '/var/lib/cloud9/bonescript.log',

    readPWMFreqAndValue: function (pin, pwm) {
        var mode = {};
        try {
            var period = fs.readFileSync(pwmPrefix[pin.pwm.name] + '/period_ns');
            var duty = fs.readFileSync(pwmPrefix[pin.pwm.name] + '/duty_ns');
            mode.freq = 1.0e9 / period;
            mode.value = duty / period;
        } catch (ex) {}
        return (mode);
    },

    readGPIODirection: function (n, gpio) {
        var mode = {};
        var directionFile = "/sys/class/gpio/gpio" + n + "/direction";
        if (my.file_existsSync(directionFile)) {
            mode.active = true;
            var direction = fs.readFileSync(directionFile, 'utf-8');
            direction = direction.replace(/^\s+|\s+$/g, '');
            mode.direction = direction;
        }
        return (mode);
    },

    readPinMux: function (pin, mode, callback) {
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
    },

    setPinMode: function (pin, pinData, template, resp, callback) {
        if (debug) winston.debug('hw.setPinMode(' + [pin.key, pinData, template, JSON.stringify(resp)] + ');');
        var p = "ocp:" + pin.key + "_pinmux";
        if (!pin.universalName) {
            pin.universalName = [p];
            if (pin.ball && pin.ball.ZCZ) pin.universalName.push("ocp:" + pin.ball.ZCZ + "_pinmux");
        }
        var pinmux = my.find_sysfsFile(p, my.is_ocp(), pin.universalName);
        gpioFile[pin.key] = '/sys/class/gpio/gpio' + pin.gpio + '/value';
        if (pinmux) {
            var state = undefined;
            if ((pinData & 7) == 7) {
                state = 'gpio';
                switch (pinData & 0x18) {
                case 0x00:
                    state = 'gpio_pd';
                    break;
                case 0x10:
                    state = 'gpio_pu';
                    break;
                default:
                    break;
                }
            } else if (template == 'bspwm' || template == 'pwm') {
                state = "pwm";
                if (pin.pwm.universalMode) state = pin.pwm.universalMode;
            } else {
                resp.err = 'Unknown pin mode template';
                winston.error(resp.err);
            }
            if (!resp.err) {
                fs.writeFileSync(pinmux + "/state", state);
            }
        } else {
            resp.err = 'No pinmux for ' + pin.key;
            if (debug) winston.debug(resp.err);
        }

        if (template == 'bspwm') {
            // Buld a path like: /sys/devices/platform/ocp/48304000.epwmss/48304200.ehrpwm/pwm/pwmchip5/pwm5-:0
            // pin.pwm.chip looks up the first address and pin.pwm.addr looks up the second
            // file_find figures which pwmchip to use
            // pin.pwm.index tells with half of the PWM to use (0 or 1)
            var chipPath = my.file_find('/sys/devices/platform/ocp', pin.pwm.chip, 1);
            if (debug) winston.debug("chipPath = " + chipPath);
            var addrPath = my.file_find(chipPath, pin.pwm.addr, 1);
            if (debug) winston.debug("addrPath = " + addrPath);
            var pwmchipPath = my.file_find(addrPath + '/pwm', 'pwmchip', 1);
            if (debug) winston.debug("pwmchipPath = " + pwmchipPath);
            var pwmPath = my.file_find(pwmchipPath, "pwm.*" + pin.pwm.index + "$", 1);
            if (debug) winston.debug("pwmPath = " + pwmPath);
            if (pwmchipPath && !pwmPath) {
                fs.appendFileSync(pwmchipPath + '/export', pin.pwm.index);
                pwmPath = my.file_find(pwmchipPath, "pwm.*" + pin.pwm.index + "$", 1);
                if (debug) winston.debug("pwmPath = " + pwmPath);
            }
            if (pwmPath) {
                pwmPrefix[pin.pwm.name] = pwmPath;
            }
            //fs.appendFileSync(pwmPrefix[pin.pwm.name]+'/enable', 1);
        }

        if (callback) callback(resp);
        return (resp);
    },

    setLEDPinToGPIO: function (pin, resp) {
        if (debug) winston.debug('setLEDPinTGPIO: ' + pin.key);
        var path;
        if (Array.isArray(pin.led)) {
            resp.err = "Unable to handle LED definition as array " + pin.led;
            winston.error(resp.err);
            resp.value = false;
            return (resp);
        }
        path = "/sys/class/leds/" + pin.led + "/trigger";

        if (my.file_existsSync(path)) {
            fs.writeFileSync(path, "gpio");
        } else {
            resp.err = "Unable to find LED " + pin.led;
            winston.error(resp.err);
            resp.value = false;
        }

        return (resp);
    },

    exportGPIOControls: function (pin, direction, resp, callback) {
        if (debug) winston.debug('hw.exportGPIOControls(' + [pin.key, direction, resp] + ');');
        var n = pin.gpio;
        var exists = my.file_existsSync(gpioFile[pin.key]);

        if (!exists) {
            if (debug) winston.debug("exporting gpio: " + n);
            fs.writeFileSync("/sys/class/gpio/export", "" + n, null);
        }
        var directionFile = "/sys/class/gpio/gpio" + n + "/direction";
        if (debug) winston.debug('Writing GPIO direction(' + direction + ') to ' +
            directionFile + ');');
        fs.writeFileSync(directionFile, direction);
        return (resp);
    },

    writeGPIOValue: function (pin, value, callback) {
        if (typeof gpioFile[pin.key] == 'undefined') {
            gpioFile[pin.key] = '/sys/class/gpio/gpio' + pin.gpio + '/value';
            if (pin.led) {
                gpioFile[pin.key] = "/sys/class/leds/" + pin.led + "/brightness";
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
    },

    readGPIOValue: function (pin, resp, callback) {
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
    },

    enableAIN: function (callback) {
        if (!my.file_existsSync(ainPrefix)) {
            if (debug) winston.debug('enableAIN: loading ' + AINdts);
            fs.writeFileSync(SLOTS, AINdts); // Loads AINdts
        }
        if (!my.file_existsSync(ainPrefix)) {
            if (debug) winston.debug('enableAIN: load of ' + AINdts + ' failed');
        }
        if (callback) {
            callback({
                'path': ainPrefix
            });
        }
        return (ainPrefix);
    },

    readAIN: function (pin, resp, callback) {
        var maxValue = 4095;
        var ainFile = ainPrefix + '/in_voltage' + pin.ain.toString() + '_raw';
        if (debug) winston.debug("readAIN: ainFile=" + ainFile);
        if (callback) {
            var readFile = function (err, data) {
                if (err) {
                    resp.err = 'analogRead error: ' + err;
                    winston.error(resp.err);
                }
                resp.value = parseInt(data, 10) / maxValue;
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
        resp.value = resp.value / maxValue;
        if (isNaN(resp.value)) {
            resp.err = 'analogRead(' + pin.key + ') scaled to ' + resp.value;
            winston.error(resp.err);
        }
        return (resp);
    },

    writeGPIOEdge: function (pin, mode) {
        fs.writeFileSync('/sys/class/gpio/gpio' + pin.gpio + '/edge', mode);

        var resp = {};
        resp.gpioFile = '/sys/class/gpio/gpio' + pin.gpio + '/value';
        resp.valuefd = fs.openSync(resp.gpioFile, 'r');
        resp.value = new Buffer(1);

        return (resp);
    },

    writePWMFreqAndValue: function (pin, pwm, freq, value, resp, callback) {
        if (debug) winston.debug('hw.writePWMFreqAndValue(' + [pin.key, util.inspect(pwm), freq, value, resp] + ');');
        var path = pwmPrefix[pin.pwm.name];
        try {
            var period = Math.round(1.0e9 / freq); // period in ns
            if (debug) winston.debug('hw.writePWMFreqAndValue: pwm.freq=' + pwm.freq +
                ', freq=' + freq + ', period=' + period);
            if (pwm.freq != freq) {
                try {
                    if (debug) winston.debug('Stopping PWM');
                    fs.writeFileSync(path + '/enable', "0\n");
                } catch (ex2) {
                    if (debug) winston.debug('Error stopping PWM: ' + ex2);
                }
                // It appears that the first time you set the pwm you have to
                // set the period before you set the duty_cycle
                try {
                    if (debug) winston.debug('Updating PWM period: ' + period);
                    fs.writeFileSync(path + '/period', period + "\n");
                } catch (ex2) {
                    period = fs.readFileSync(path + '/period');
                    winston.info('Unable to update PWM period, period is set to ' +
                        period +
                        "\tIs other half of PWM enabled?");
                }
                try {
                    if (debug) winston.debug('Starting PWM');
                    fs.writeFileSync(path + '/enable', "1\n");
                } catch (ex2) {
                    if (debug) winston.debug('Error starting PWM: ' + ex2);
                }
            }
            var duty = Math.round(period * value);
            if (debug) winston.debug('Updating PWM duty: ' + duty);
            //if(duty == 0) winston.error('Updating PWM duty: ' + duty);
            fs.writeFileSync(path + '/duty_cycle', duty + "\n");
        } catch (ex) {
            resp.err = 'error updating PWM freq and value: ' + path + ', ' + ex;
            winston.error(resp.err);
        }
        return (resp);
    },

    readEeproms: function (eeproms) {
        var EepromFiles = {
            '/sys/bus/i2c/devices/0-0050/0-00500/nvmem': {
                type: 'bone'
            },
            '/sys/bus/i2c/devices/2-0054/2-00540/nvmem': {
                type: 'cape'
            },
            '/sys/bus/i2c/devices/2-0055/2-00550/nvmem': {
                type: 'cape'
            },
            '/sys/bus/i2c/devices/2-0056/2-00560/nvmem': {
                type: 'cape'
            },
            '/sys/bus/i2c/devices/2-0057/2-00570/nvmem': {
                type: 'cape'
            }
        };
        eeproms = eeprom.readEeproms(EepromFiles);
        return (eeproms);
    },

    readPlatform: function (platform) {
        var eeproms = eeprom.readEeproms({
            '/sys/bus/i2c/devices/0-0050/0-00500/nvmem': {
                type: 'bone'
            }
        });
        var x = eeproms['/sys/bus/i2c/devices/0-0050/0-00500/nvmem'];
        platform.name = fs.readFileSync('/proc/device-tree/model', 'ascii').trim().replace(/\0/g, '');
        if (platform.name.indexOf('Green') > 0) {
            platform.name = platform.name.replace('TI AM335x', 'SeeedStudio')
        }
        if (platform.name.indexOf('Arduino') > 0) {
            platform.name = platform.name.replace('TI AM335x', '')
        }
        platform.name = platform.name.replace('TI AM335x BeagleBone', 'BeagleBoard.org BeagleBone');
        platform.name = platform.name.replace('TI AM5728 BeagleBoard-X15', 'BeagleBoard.org BeagleBoard-X15');
        if (x && x.version) {
            platform.version = x.version;
            if (!platform.version.match(/^[\040-\176]*$/)) delete platform.version;
        }
        if (x && x.serialNumber) {
            platform.serialNumber = x.serialNumber;
            if (!platform.serialNumber.match(/^[\040-\176]*$/)) delete platform.serialNumber;
        }
        try {
            platform.dogtag = fs.readFileSync('/etc/dogtag', 'ascii');
        } catch (ex) {}
        return (platform);
    }
}