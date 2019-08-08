// Copyright (C) 2011 - Texas Instruments, Jason Kridner
//
//
var fs = require('fs');
var child_process = require('child_process');
var winston = require('winston');
var os = require('os');
var bone = require('./bone'); // Database of pins
var functions = require('./functions'); // functions.js defines several math/bit functions that are handy
var serial = require('./serial');
var iic = require('./iic');
var my = require('./my');
var package_json = require('../package.json');
var g = require('./constants');
var fibers = my.require('fibers');
var epoll = my.require('epoll');
var autorun = require('./autorun');
var server = require('./server');
var socketHandlers = require('./socket_handlers');
var ffi = require('./ffiimp');
var rc = require('./rc');

var debug = process.env.DEBUG ? true : false;

// Detect if we are on a Beagle
var hw;
if (os.type() == 'Linux' && os.arch() == 'arm') {
    var osVer = ("" + os.release()).split('.');
    if (debug) console.log(osVer.join(":"));
    if (my.is_new_capemgr() || osVer[0] > 4 ||
        (osVer[0] == 4 && osVer[1] >= 4)) {
        // Used for 4.4+ kernels using capemgr and universal helpers
        hw = require('./hw_mainline');
        if (debug) console.log('Using Mainline interface');
    } else if (my.is_cape_universal()) {
        // Used for 3.8 kernels using a single universal overlay with pinmux helpers
        //  located in debugfs at /sys/kernel/debug/pinctrl/44e10800.pinmux/pins
        hw = require('./hw_universal');
        if (debug) console.log('Using Universal Cape interface');
    } else if (my.is_capemgr()) {
        // Used for 3.8 kernels using an older out-of-tree version of CapeMgr
        hw = require('./hw_capemgr');
        if (debug) console.log('Using CapeMgr interface');
    } else {
        // Used for 3.2 kernels using /sys/kernel/debug/omap_mux/
        hw = require('./hw_oldkernel');
        if (debug) console.log('Using 3.2 kernel interface');
    }
} else {
    // Incomplete implementation of a set of hardware stubs to run on non BeagleBone targets
    hw = require('./hw_simulator');
    if (debug) winston.debug('Using simulator mode');
}

if (debug) {
    winston.add(winston.transports.File, {
        filename: hw.logfile,
        level: 'debug'
    });
    winston.level = 'debug';
} else {
    winston.setLevels(winston.config.syslog.levels);
}

if (debug) winston.debug('index.js loaded');

var f = {};

// Keep track of allocated resources
var gpio = {};
var gpioInt = {};
var pwm = {};
var ain = false;

// returned object has:
//  mux: index of mux mode
//  options: array of mode names
//  slew: 'fast' or 'slow'
//  rx: 'enabled' or 'disabled'
//  pullup: 'diabled', 'pullup' or 'pulldown'
//  pin: key string for pin
//  name: pin name
//  pwm: object if pwm enabled, undefind otherwise
//    freq: frequency of PWM
//    value: duty cycle of PWM as number between 0 and 1
//  gpio: object if GPIO enabled, undefined otherwise
//    active: GPIO is enabled by the kernel
//    allocated: boolean for if it is allocated by this application
//    direction: 'in' or 'out' (allocated might be false)
f.getPinMode = function (pin, callback) {
    pin = my.getpin(pin);
    if (debug) winston.debug('getPinMode(' + pin.key + ');');
    var mode = {
        'pin': pin.key,
        'name': pin.name
    };
    if (pin.options) mode.options = pin.options;

    // Get PWM settings if applicable
    if (
        (typeof pin.pwm != 'undefined') // pin has PWM capabilities
        &&
        (typeof pwm[pin.pwm.name] != 'undefined') // PWM used for this pin is enabled
        &&
        (pin.key == pwm[pin.pwm.name].key) // PWM is allocated for this pin
    ) {
        mode.pwm = hw.readPWMFreqAndValue(pin, pwm[pin.pwm.name]);
    }

    // Get GPIO settings if applicable
    if ((typeof pin.gpio != 'undefined')) {
        var n = pin.gpio;
        mode.gpio = hw.readGPIODirection(n, gpio);
        if (typeof gpio[n] == 'undefined') {
            mode.gpio.allocated = false;
        } else {
            mode.gpio.allocated = true;
        }
    }

    // Get pinmux settings
    mode = hw.readPinMux(pin, mode, callback);
    return (mode);
};
f.getPinMode.args = ['pin', 'callback'];

f.pinMode = function (pin, direction, mux, pullup, slew, callback) {
    pin = my.getpin(pin);
    if (debug) winston.debug('pinMode(' + [pin.key, direction, mux, pullup, slew] + ');');
    if (direction == g.INPUT_PULLUP) pullup = 'pullup';
    pullup = pullup || ((direction == g.INPUT) ? 'pulldown' : 'disabled');
    slew = slew || 'fast';
    mux = (typeof mux != 'undefined') ? mux : 7; // default to GPIO mode
    var resp = {
        value: true
    };
    var template = 'bspm';
    var n = pin.gpio;

    if (
        direction == g.ANALOG_OUTPUT ||
        mux == g.ANALOG_OUTPUT ||
        (typeof pin.pwm != 'undefined' && mux == pin.pwm.muxmode)
    ) {
        if (
            (typeof pin.pwm == 'undefined') || // pin does not have PWM capability
            (typeof pin.pwm.muxmode == 'undefined') // required muxmode is not provided
        ) {
            var err = 'pinMode only supports ANALOG_OUTPUT for PWM pins: ' + pin.key;
            winston.info(err);
            if (callback) { //support both nodestyle and oldstyle callbacks based on arguments length
                if (callback.length == 1) {
                    winston.warning("single argument callbacks will be deprecated.please use node-style error-first callbacks: callback(err,response)");
                    callback({
                        value: false,
                        err: err
                    });
                } else
                    callback(err, false);
            }
            return (false);
        }
        direction = g.OUTPUT;
        mux = pin.pwm.muxmode;
        template = 'bspwm';
        pwm[pin.pwm.name] = {
            'key': pin.key,
            'freq': 0
        };
    }

    if (!pin.mux) {
        winston.info('pinMode: Missing mux name for pin object: ' + JSON.stringify(pin));
    }

    // Handle case where pin is allocated as a gpio-led
    if (debug) winston.debug('pinMode: pin.led = ' + pin.led);
    if (pin.led) {
        if ((direction != g.OUTPUT) || (mux != 7)) {
            resp.err = 'pinMode only supports GPIO output for LEDs: ' + pin.key;
            winston.info(resp.err);
            resp.value = false;
            if (callback) callback(resp);
            return (false);
        }

        resp = hw.setLEDPinToGPIO(pin, resp);
        if (typeof resp.err == 'undefined') {
            gpio[n] = true;
        }
        if (callback) {
            if (callback.length == 1) {
                winston.warning("single argument callbacks will be deprecated.please use node-style error-first callbacks: callback(err,response)");
                callback(resp);
            } else
                callback(resp.err, resp.value);
        }
        return (resp.value);
    }

    // Figure out the desired value
    var pinData = my.pin_data(slew, direction, pullup, mux);

    // May be required: mount -t debugfs none /sys/kernel/debug
    resp = hw.setPinMode(pin, pinData, template, resp);

    if (typeof resp.err != 'undefined') {
        if (debug) winston.debug('Unable to configure mux for pin ' + pin + ': ' + resp.err);
        // It might work if the pin is already muxed to desired mode
        var currentMode = f.getPinMode(pin);
        if (currentMode.mux != mux) {
            resp.value = false;
            winston.info(resp.err);
            delete gpio[n];
            if (callback) {
                if (callback.length == 1) {
                    winston.warning("single argument callbacks will be deprecated.please use node-style error-first callbacks: callback(err,response)");
                    callback(resp);
                } else
                    callback(resp.err, resp.value);
            }
            return (resp.value);
        }
    }

    // Enable GPIO and set direction
    if (mux == 7) {
        // Export the GPIO controls
        resp = hw.exportGPIOControls(pin, direction, resp);
        if (typeof resp.err != 'undefined') {
            if (typeof gpio[n] == 'undefined') {
                delete gpio[n];
            }
        } else {
            gpio[n] = true;
        }
    } else {
        delete gpio[n];
    }

    if (callback) {
        if (callback.length == 1) {
            winston.warning("single argument callbacks will be deprecated.please use node-style error-first callbacks: callback(err,response)");
            callback(resp);
        } else
            callback(resp.err, resp.value);
    }
    return (resp.value);
};
f.pinMode.args = ['pin', 'direction', 'mux', 'pullup', 'slew', 'callback'];

f.digitalWrite = function (pin, value, callback) {
    var myCallback = false;
    if (callback) myCallback = function (resp) {
        if (!resp || (typeof resp != 'object')) resp = {
            'data': resp
        };
        callback(resp);
    }
    pin = my.getpin(pin);
    if (debug) winston.debug('digitalWrite(' + [pin.key, value] + ');');
    value = parseInt(Number(value), 2) ? 1 : 0;
    //handle case digitalWrite() on Analog_Out
    if (typeof pin.pwm != 'undefined') {
        var gpioEnabled = (7 == f.getPinMode(pin).mux); //check whether pin set as gpio
        if (!gpioEnabled) {
            winston.debug([pin.key, value] + ' set as ANALOG_OUTPUT modifying duty cycle according to value');
            f.analogWrite(pin, value, 2000, myCallback); //write duty cycle as per value
            return (true);
        }
    }

    hw.writeGPIOValue(pin, value, myCallback);

    return (true);
};
f.digitalWrite.args = ['pin', 'value', 'callback'];

f.digitalRead = function (pin, callback) {
    pin = my.getpin(pin);
    if (debug) winston.debug('digitalRead(' + [pin.key] + ');');
    var resp = {};
    if (typeof pin.ain != 'undefined') {
        if (callback) {
            f.analogRead(pin, analogCallback);
        } else {
            resp.value = f.analogRead(pin);
            if (resp.value >= 0.5) {
                resp.value = g.HIGH;
            } else {
                resp.value = g.LOW;
            }
        }
    } else {
        resp = hw.readGPIOValue(pin, resp, callback);
    }

    function analogCallback(x) {
        if (callback.length == 1) {
            winston.warning("single argument callbacks will be deprecated.please use node-style error-first callbacks: callback(err,response)");
            callback(analogValue(x));
        } else
            callback(x.err, analogValue(x).value);
    }

    function analogValue(x) {
        if (typeof x.value == 'undefined') return;
        if (x.value >= 0.5) {
            x.value = g.HIGH;
        } else {
            x.value = g.LOW;
        }
        return x;
    }

    return (resp.value);
};
f.digitalRead.args = ['pin', 'callback'];

f.analogRead = function (pin, callback) {
    pin = my.getpin(pin);
    if (debug) winston.debug('analogRead(' + [pin.key] + ');');
    var resp = {};
    if (!ain) {
        ain = hw.enableAIN();
    }
    if (typeof pin.ain == 'undefined') {
        resp.value = f.digitalRead(pin, callback);
    } else {
        resp = hw.readAIN(pin, resp, callback);
    }

    return (resp.value);
};
f.analogRead.args = ['pin', 'callback'];

f.shiftOut = function (dataPin, clockPin, bitOrder, val, callback) {
    dataPin = my.getpin(dataPin);
    clockPin = my.getpin(clockPin);
    if (debug) winston.debug('shiftOut(' + [dataPin.key, clockPin.key, bitOrder, val] + ');');
    var i = 0;
    var bit;
    var clock = 0;

    function next(err) {
        if (debug) winston.debug('i = ' + i);
        if (debug) winston.debug('clock = ' + clock);
        if (err || i == 8) {
            callback({
                'err': err
            });
            return;
        }
        if (bitOrder == g.LSBFIRST) {
            bit = val & (1 << i);
        } else {
            bit = val & (1 << (7 - i));
        }
        if (clock === 0) {
            clock = 1;
            if (bit) {
                f.digitalWrite(dataPin, g.HIGH, next);
            } else {
                f.digitalWrite(dataPin, g.LOW, next);
            }
        } else if (clock == 1) {
            clock = 2;
            f.digitalWrite(clockPin, g.HIGH, next);
        } else if (clock == 2) {
            i++;
            clock = 0;
            f.digitalWrite(clockPin, g.LOW, next);
        }
    }

    if (callback) {
        next();
    } else {
        for (i = 0; i < 8; i++) {
            if (bitOrder == g.LSBFIRST) {
                bit = val & (1 << i);
            } else {
                bit = val & (1 << (7 - i));
            }

            if (bit) {
                f.digitalWrite(dataPin, g.HIGH);
            } else {
                f.digitalWrite(dataPin, g.LOW);
            }
            f.digitalWrite(clockPin, g.HIGH);
            f.digitalWrite(clockPin, g.LOW);
        }
    }
};
f.shiftOut.args = ['dataPin', 'clockPin', 'bitOrder', 'val', 'callback'];

f.attachInterrupt = function (pin, handler, mode, callback) {
    pin = my.getpin(pin);
    if (debug) winston.debug('attachInterrupt(' + [pin.key, handler, mode] + ');');
    var n = pin.gpio;
    var resp = {
        'pin': pin,
        'attached': false
    };

    // Check if we don't have the required Epoll module
    if (!epoll.exists) {
        resp.err = 'attachInterrupt: requires Epoll module';
        if (debug) winston.debug(resp.err);
        if (callback) {
            if (callback.length == 1) {
                winston.warning("single argument callbacks will be deprecated.please use node-style error-first callbacks: callback(err,response)");
                callback(resp);
            } else {
                var err = resp.err;
                delete resp.err;
                callback(err, resp);
            }
        }
        return (resp.attached);
    }

    // Check if pin isn't already configured as GPIO
    if (typeof gpio[n] == 'undefined') {
        resp.err = 'attachInterrupt: pin ' + pin.key + ' not already configured as GPIO';
        if (debug) winston.debug(resp.err);
        resp.attached = false;
        resp.configured = false;
        if (callback) {
            if (callback.length == 1) {
                winston.warning("single argument callbacks will be deprecated.please use node-style error-first callbacks: callback(err,response)");
                callback(resp);
            } else {
                var err = resp.err;
                delete resp.err;
                callback(err, resp);
            }
        }
        return (resp);
    }

    // Check if someone already has a handler configured
    if (typeof gpioInt[n] != 'undefined') {
        resp.err = 'attachInterrupt: pin ' + pin.key + ' already has an interrupt handler assigned';
        if (debug) winston.debug(resp.err);
        resp.attached = false;
        resp.configured = true;
        if (callback) {
            if (callback.length == 1) {
                winston.warning("single argument callbacks will be deprecated.please use node-style error-first callbacks: callback(err,response)");
                callback(resp);
            } else {
                var err = resp.err;
                delete resp.err;
                callback(err, resp);
            }
        }
        return (resp.attached);
    }

    handler = (typeof handler === "string") ? my.myeval('(' + handler + ')') : handler;

    var intHandler = function (err, fd, events) {
        var m = {};
        if (err) {
            m.err = err;
        }
        fs.readSync(gpioInt[n].valuefd, gpioInt[n].value, 0, 1, 0);
        m.pin = pin;
        m.value = parseInt(gpioInt[n].value.toString(), 2);
        if (typeof handler == 'function') m.output = handler(m);
        else m.output = {
            handler: handler
        };
        if (m.output && (typeof callback == 'function')) {
            if (callback.length == 1) {
                winston.warning("single argument callbacks will be deprecated.please use node-style error-first callbacks: callback(err,response)");
                callback(m);
            } else {
                var err = m.err;
                delete m.err;
                callback(err, m);
            }
        }
    };

    try {
        gpioInt[n] = hw.writeGPIOEdge(pin, mode);
        gpioInt[n].epoll = new epoll.Epoll(intHandler);
        fs.readSync(gpioInt[n].valuefd, gpioInt[n].value, 0, 1, 0);
        gpioInt[n].epoll.add(gpioInt[n].valuefd, epoll.Epoll.EPOLLPRI);
        resp.attached = true;
    } catch (ex) {
        resp.err = 'attachInterrupt: GPIO input file not opened: ' + ex;
        if (debug) winston.debug(resp.err);
    }
    if (callback) {
        if (callback.length == 1) {
            winston.warning("single argument callbacks will be deprecated.please use node-style error-first callbacks: callback(err,response)");
            callback(resp);
        } else {
            var err = resp.err;
            delete resp.err;
            callback(err, resp);
        }
    }
    return (resp.attached);
};
f.attachInterrupt.args = ['pin', 'handler', 'mode', 'callback'];

f.detachInterrupt = function (pin, callback) {
    pin = my.getpin(pin);
    if (debug) winston.debug('detachInterrupt(' + [pin.key] + ');');
    var n = pin.gpio;
    if (typeof gpio[n] == 'undefined' || typeof gpioInt[n] == 'undefined') {
        if (callback) {
            if (callback.length == 1) {
                winston.warning("single argument callbacks will be deprecated.please use node-style error-first callbacks: callback(err,response)");
                callback({
                    'pin': pin,
                    'detached': false
                });
            } else
                callback(true, {
                    'pin': pin,
                    'detached': false
                });
        }
        return (false);
    }
    gpioInt[n].epoll.remove(gpioInt[n].valuefd);
    delete gpioInt[n];
    if (callback) {
        if (callback.length == 1) {
            winston.warning("single argument callbacks will be deprecated.please use node-style error-first callbacks: callback(err,response)");
            callback({
                'pin': pin,
                'detached': true
            });
        } else
            callback(null, {
                'pin': pin,
                'detached': true
            });
    }
    return (true);
};
f.detachInterrupt.args = ['pin', 'callback'];

// See http://processors.wiki.ti.com/index.php/AM335x_PWM_Driver's_Guide
// That guide isn't useful for the new pwm_test interface
f.analogWrite = function (pin, value, freq, callback) {
    pin = my.getpin(pin);
    if (debug) winston.debug('analogWrite(' + [pin.key, value, freq] + ');');
    freq = freq || 2000.0;
    var resp = {};

    // Make sure the pin has a PWM associated
    if (typeof pin.pwm == 'undefined') {
        //handle analogWrite() on digital OUTPUT
        if (typeof pin.gpio != 'undefined') {
            if (value >= 0.5) {
                if (callback)
                    f.digitalWrite(pin, g.HIGH, callback);
                else
                    f.digitalWrite(pin, g.HIGH);
                return (true);
            } else {
                if (callback)
                    f.digitalWrite(pin, g.LOW, callback);
                else
                    f.digitalWrite(pin, g.LOW);
                return (true);
            }
        }
        resp.err = 'analogWrite: ' + pin.key + ' does not support analogWrite()';
        winston.error(resp.err);
        if (callback) callback(resp);
        return (false);
    }

    // Make sure there is no one else who has the PWM
    if (
        (typeof pwm[pin.pwm.name] != 'undefined') // PWM needed by this pin is already allocated
        &&
        (pin.key != pwm[pin.pwm.name].key) // allocation is not by this pin
    ) {
        resp.err = 'analogWrite: ' + pin.key + ' requires pwm ' + pin.pwm.name +
            ' but it is already in use by ' + pwm[pin.pwm.name].key;
        winston.error(resp.err);
        if (callback) callback(resp);
        return (false);
    }

    // Enable PWM controls if not already done
    if (typeof pwm[pin.pwm.name] == 'undefined') {
        var pinMode = f.getPinMode(pin.key);
        var slew = pinMode.slew || 'fast';
        var pullup = pinMode.pullup || 'disabled';
        f.pinMode(pin, g.ANALOG_OUTPUT, pin.pwm.muxmode, pullup, slew);
    }

    // Perform update
    resp = hw.writePWMFreqAndValue(pin, pwm[pin.pwm.name], freq, value, resp);

    // Save off the freq, value and PWM assignment
    pwm[pin.pwm.name].freq = freq;
    pwm[pin.pwm.name].value = value;

    // All done
    if (callback) callback(resp);
    return (true);
};
f.analogWrite.args = ['pin', 'value', 'freq', 'callback'];

f.getEeproms = function (callback) {
    var eeproms = {};
    eeproms = hw.readEeproms(eeproms);
    if (eeproms == {}) {
        if (debug) winston.debug('No valid EEPROM contents found');
    }
    if (callback) {
        if (callback.length == 1) {
            winston.warning("single argument callbacks will be deprecated.please use node-style error-first callbacks: callback(err,response)");
            callback(eeproms);
        } else
            callback(eeproms == {} ? 'No valid EEPROM contents found' : null, eeproms);
    }
    return (eeproms);
};
f.getEeproms.args = ['callback'];

f.readTextFile = function (filename, callback) {
    if (typeof callback == 'function') {
        var cb = function (err, data) {
            callback({
                'err': err,
                'data': data
            });
        };
        if (callback.length == 1) {
            winston.warning("single argument callbacks will be deprecated.please use node-style error-first callbacks: callback(err,response)");
            fs.readFile(filename, 'ascii', cb);
        } else
            fs.readFile(filename, 'ascii', callback);
    } else {
        return fs.readFileSync(filename, 'ascii');
    }
};
f.readTextFile.args = ['filename', 'callback'];

f.writeTextFile = function (filename, data, callback) {
    if (typeof callback == 'function') {
        var cb = function (err) {
            callback({
                'err': err
            });
        };
        fs.writeFile(filename, data, 'ascii', cb);
    } else {
        try {
            return fs.writeFileSync(filename, data, 'ascii');
        } catch (ex) {
            winston.error("writeTextFile error: " + ex);
            return (false);
        }
    }
};
f.writeTextFile.args = ['filename', 'data', 'callback'];

f.getPlatform = function (callback) {
    var platform = {
        'platform': bone,
        'name': "BeagleBone",
        'bonescript': package_json.version,
        'os': {}
    };
    platform.os.hostname = os.hostname();
    platform.os.type = os.type();
    platform.os.arch = os.arch();
    platform.os.release = os.release();
    platform.os.uptime = os.uptime();
    platform.os.loadavg = os.loadavg();
    platform.os.totalmem = os.totalmem();
    platform.os.freemem = os.freemem();
    platform.os.networkInterfaces = os.networkInterfaces();
    platform = hw.readPlatform(platform);
    if (callback) {
        if (callback.length == 1) {
            winston.warning("single argument callbacks will be deprecated.please use node-style error-first callbacks: callback(err,response)");
            callback(platform);
        } else
            callback(null, platform);
    }
    return (platform);
};
f.getPlatform.args = ['callback'];

f.echo = function (data, callback) {
    winston.info(data);
    if (callback) {
        if (callback.length == 1) {
            winston.warning("single argument callbacks will be deprecated.please use node-style error-first callbacks: callback(err,response)");
            callback({
                'data': data
            });
        } else
            callback(null, data);
    }
    return (data);
};
f.echo.args = ['data', 'callback'];

f.setDate = function (date, callback) {
    child_process.exec('date -s "' + date + '"', dateResponse);

    function dateResponse(error, stdout, stderr) {
        if (typeof callback != 'function') return;
        else {
            if (callback.length == 1) {
                winston.warning("single argument callbacks will be deprecated.please use node-style error-first callbacks: callback(err,response)");
                callback({
                    'error': error,
                    'stdout': stdout,
                    'stderr': stderr
                });
            } else
                callback({
                    'error': error,
                    'stderr': stderr
                }, stdout);
        }
    }
};
f.setDate.args = ['date', 'callback'];

f.delay = function (ms) {
    var fiber = fibers.current;
    if (typeof fiber == 'undefined') {
        winston.error('sleep may only be called within the setup or run functions');
        return;
    }
    setTimeout(function () {
        fiber.run();
    }, ms);
    fibers.yield();
};

// Exported variables
f.bone = bone; // this likely needs to be platform and be detected
for (var x in functions) {
    f[x] = functions[x];
}
for (var x in serial) {
    f[x] = serial[x];
}
for (var x in iic) {
    f[x] = iic[x];
}
for (var x in g) {
    f[x] = g[x];
}
for (var x in autorun) {
    f[x] = autorun[x];
}
for (var x in server) {
    f[x] = server[x];
}
for (var x in socketHandlers) {
    f[x] = socketHandlers[x];
}
for (var x in ffi) {
    f[x] = ffi[x];
}
for (var x in rc) {
    f[x] = rc[x];
}


var alreadyRan = false;

function run() {
    if (debug) winston.debug('Calling run()');
    if (alreadyRan) return (false);
    alreadyRan = true;
    // 'setup' and 'loop' are globals that may or may not be defined
    if (typeof global.setup == 'function' || typeof global.loop == 'function') {
        fibers(function () {
            if (typeof global.setup == 'function') {
                winston.debug('Running setup()');
                global.setup();
            }
            if (typeof global.loop == 'function') {
                if (debug) winston.debug('Starting loop()');
                while (1) {
                    global.loop();
                }
            }
        }).run();
    }
}
process.nextTick(run);

// Global variable assignments
// This section is broken out because it will eventually be deprecated
f.setGlobals = function () {
    for (var x in f) {
        global[x] = f[x];
    }
    global.run = run;
};
module.exports = f;