var fs = require('fs');
var winston = require('winston');
var my = require('./my');
var parse = require('./parse');
var eeprom = require('./eeprom');

var debug = process.env.DEBUG ? true : false;

var gpioFile = {};
var pwmPrefix = {};
var ainPrefix = "";

exports.logfile = '/var/lib/cloud9/bonescript.log';

exports.readPWMFreqAndValue = function(pin, pwm) {
    var mode = {};
    try {
        var period = fs.readFileSync(pwmPrefix[pin.pwm.name]+'/period_ns');
        var duty = fs.readFileSync(pwmPrefix[pin.pwm.name]+'/duty_ns');
        mode.freq = 1.0e9 / period;
        mode.value = duty / period;
    } catch(ex) {
    }
    return(mode);
};

exports.readGPIODirection = function(n, gpio) {
    var mode = {};
    var directionFile = "/sys/class/gpio/gpio" + n + "/direction";
    if(my.file_existsSync(directionFile)) {
        mode.active = true;
        var direction = fs.readFileSync(directionFile, 'utf-8');
        direction = direction.replace(/^\s+|\s+$/g, '');
        mode.direction = direction;
    }
    return(mode);
};

exports.readPinMux = function(pin, mode, callback) {
    var pinctrlFile = '/sys/kernel/debug/pinctrl/44e10800.pinmux/pins';
    var muxRegOffset = parseInt(pin.muxRegOffset, 16);
    var readPinctrl = function(err, data) {
        if(err) {
            mode.err = 'readPinctrl error: ' + err;
            if(debug) winston.debug(mode.err);
            callback(mode);
        }
        mode = parse.modeFromPinctrl(data, muxRegOffset, 0x44e10800, mode);
        callback(mode);
    };
    var tryPinctrl = function(exists) {
        if(exists) {
            fs.readFile(pinctrlFile, 'utf8', readPinctrl);
        } else {
            if(debug) winston.debug('getPinMode(' + pin.key + '): no valid mux data');
            callback(mode);
        }
    };
    if(callback) {
        my.file_exists(pinctrlFile, tryPinctrl);
    } else {
        try {
            var data2 = fs.readFileSync(pinctrlFile, 'utf8');
            mode = parse.modeFromPinctrl(data2, muxRegOffset, 0x44e10800, mode);
        } catch(ex) {
            if(debug) winston.debug('getPinMode(' + pin.key + '): ' + ex);
        }
    }
    return(mode);
};

exports.setPinMode = function(pin, pinData, template, resp, callback) {
    if(debug) winston.debug('hw.setPinMode(' + [pin.key, pinData, template, JSON.stringify(resp)] + ');');
    var p = pin.key + "_pinmux";
    if(pin.universalName) p = pin.universalName + "_pinmux";
    var pinmux = my.find_sysfsFile(p, my.is_ocp(), p + '.');
    if(!pinmux) { throw p + " was not found under " + my.is_ocp(); }
    if((pinData & 7) == 7) {
        gpioFile[pin.key] = '/sys/class/gpio/gpio' + pin.gpio + '/value';
        fs.writeFileSync(pinmux+"/state", 'gpio');
    } else if(template == 'bspwm') {
        fs.writeFileSync(pinmux+"/state", 'pwm');
        pwmPrefix[pin.pwm.name] = '/sys/class/pwm/pwm' + pin.pwm.sysfs;
        if(!my.file_existsSync(pwmPrefix[pin.pwm.name])) {
            fs.appendFileSync('/sys/class/pwm/export', pin.pwm.sysfs);
        }
        fs.appendFileSync(pwmPrefix[pin.pwm.name]+'/run', 1);
    } else {
        resp.err = 'Unknown pin mode template';
    }
    if(callback) callback(resp);
    return(resp);
};

exports.setLEDPinToGPIO = function(pin, resp) {
    var path = "/sys/class/leds/beaglebone:green:" + pin.led + "/trigger";

    if(my.file_existsSync(path)) {
        fs.writeFileSync(path, "gpio");
    } else {
        resp.err = "Unable to find LED " + pin.led;
        winston.error(resp.err);
        resp.value = false;
    }

    return(resp);
};

exports.exportGPIOControls = function(pin, direction, resp, callback) {
    if(debug) winston.debug('hw.exportGPIOControls(' + [pin.key, direction, resp] + ');');
    var n = pin.gpio;
    var exists = my.file_existsSync(gpioFile[pin.key]);
    
    if(!exists) {
        if(debug) winston.debug("exporting gpio: " + n);
        fs.writeFileSync("/sys/class/gpio/export", "" + n, null);
    }
    var directionFile = "/sys/class/gpio/gpio" + n + "/direction";
    if(debug) winston.debug('Writing GPIO direction(' + direction + ') to ' + 
        directionFile + ');');
    fs.writeFileSync(directionFile, direction);
    return(resp);
};

exports.writeGPIOValue = function(pin, value, callback) {
    if(typeof gpioFile[pin.key] == 'undefined') {
        gpioFile[pin.key] = '/sys/class/gpio/gpio' + pin.gpio + '/value';
        if(pin.led) {
            gpioFile[pin.key] = "/sys/class/leds/beaglebone:";
            gpioFile[pin.key] += "green:" + pin.led + "/brightness";
        }
        if(!my.file_existsSync(gpioFile[pin.key])) {
            winston.error("Unable to find gpio: " + gpioFile[pin.key]);
        }
    }
    if(debug) winston.debug("gpioFile = " + gpioFile[pin.key]);
    if(callback) {
        fs.writeFile(gpioFile[pin.key], '' + value, null, callback);
    } else {
        try {
            fs.writeFileSync(gpioFile[pin.key], '' + value, null);
        } catch(ex) {
            winston.error("Unable to write to " + gpioFile[pin.key]);
        }
    }
};

exports.readGPIOValue = function(pin, resp, callback) {
    var gpioFile = '/sys/class/gpio/gpio' + pin.gpio + '/value';
    if(callback) {
        var readFile = function(err, data) {
            if(err) {
                resp.err = 'digitalRead error: ' + err;
                winston.error(resp.err);
            }
            resp.value = parseInt(data, 2);
            callback(resp);
        };
        fs.readFile(gpioFile, readFile);
        return(true);
    }
    resp.value = parseInt(fs.readFileSync(gpioFile), 2);
    return(resp);
};

exports.enableAIN = function(callback) {
    var helper = "";
    if(my.load_dt('cape-bone-iio')) {
        var ocp = my.is_ocp();
        if(ocp) {
            helper = my.find_sysfsFile('helper', ocp, 'helper.');
            if(helper) {
                ainPrefix = helper + '/AIN';
            }
        }
    } else {
        if(debug) winston.debug('enableAIN: load of cape-bone-iio failed');
    }
    if(callback) {
        callback({'path': helper})
    }
    return(helper.length > 1);
};

exports.readAIN = function(pin, resp, callback) {
    var ainFile = ainPrefix + pin.ain.toString();
    if(callback) {
        var readFile = function(err, data) {
            if(err) {
                resp.err = 'analogRead error: ' + err;
                winston.error(resp.err);
            }
            resp.value = parseInt(data, 10) / 1800;
            callback(resp);
        };
        fs.readFile(ainFile, readFile);
        return(resp);
    }
    resp.value = parseInt(fs.readFileSync(ainFile), 10);
    if(isNaN(resp.value)) {
        resp.err = 'analogRead(' + pin.key + ') returned ' + resp.value;
        winston.error(resp.err);
    }
    resp.value = resp.value / 1800;
    if(isNaN(resp.value)) {
        resp.err = 'analogRead(' + pin.key + ') scaled to ' + resp.value;
        winston.error(resp.err);
    }
    return(resp);
};

exports.writeGPIOEdge = function(pin, mode) {
    fs.writeFileSync('/sys/class/gpio/gpio' + pin.gpio + '/edge', mode);

    var resp = {};
    resp.gpioFile = '/sys/class/gpio/gpio' + pin.gpio + '/value';
    resp.valuefd = fs.openSync(resp.gpioFile, 'r');
    resp.value = new Buffer(1);

    return(resp);
};

exports.writePWMFreqAndValue = function(pin, pwm, freq, value, resp, callback) {
    if(debug) winston.debug('hw.writePWMFreqAndValue(' + [pin.key,pwm,freq,value,resp] + ');');
    var path = pwmPrefix[pin.pwm.name];
    try {
        var period = Math.round( 1.0e9 / freq ); // period in ns
        if(pwm.freq != freq) {
            if(debug) winston.debug('Stopping PWM');
            fs.writeFileSync(path+'/run', "0\n");
            if(debug) winston.debug('Setting duty to 0');
            fs.writeFileSync(path+'/duty_ns', "0\n");
            try {
                if(debug) winston.debug('Updating PWM period: ' + period);
                fs.writeFileSync(path+'/period_ns', period + "\n");
            } catch(ex2) {
                period = fs.readFileSync(path+'/period_ns');
                winston.info('Unable to update PWM period, period is set to ' + period);
            }
            if(debug) winston.debug('Starting PWM');
            fs.writeFileSync(path+'/run', "1\n");
        }
        var duty = Math.round( period * value );
        if(debug) winston.debug('Updating PWM duty: ' + duty);
        //if(duty == 0) winston.error('Updating PWM duty: ' + duty);
        fs.writeFileSync(path+'/duty_ns', duty + "\n");
    } catch(ex) {
        resp.err = 'error updating PWM freq and value: ' + path + ', ' + ex;
        winston.error(resp.err);
    }
    return(resp);
};

exports.readEeproms = function(eeproms) {
    var EepromFiles = {
        '/sys/bus/i2c/drivers/at24/0-0050/eeprom': { type: 'bone' },
        '/sys/bus/i2c/drivers/at24/2-0054/eeprom': { type: 'cape' },
        '/sys/bus/i2c/drivers/at24/2-0055/eeprom': { type: 'cape' },
        '/sys/bus/i2c/drivers/at24/2-0056/eeprom': { type: 'cape' },
        '/sys/bus/i2c/drivers/at24/2-0057/eeprom': { type: 'cape' }
    };
    eeproms = eeprom.readEeproms(EepromFiles);
    return(eeproms);
};

exports.readPlatform = function(platform) {
    var eeproms = eeprom.readEeproms({
        '/sys/bus/i2c/drivers/at24/0-0050/eeprom': { type: 'bone' }
    });
    var x = eeproms['/sys/bus/i2c/drivers/at24/0-0050/eeprom'];
    if(x.boardName == 'A335BONE') platform.name = 'BeagleBone';
    if(x.boardName == 'A335BNLT') platform.name = 'BeagleBone Black';
    platform.version = x.version;
    if(!platform.version.match(/^[\040-\176]*$/)) delete platform.version;
    platform.serialNumber = x.serialNumber;
    if(!platform.serialNumber.match(/^[\040-\176]*$/)) delete platform.serialNumber;
    try {
        platform.dogtag = fs.readFileSync('/etc/dogtag', 'ascii');
    } catch(ex) {
    }
    return(platform);
};
