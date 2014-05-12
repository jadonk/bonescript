// Copyright (C) 2011 - Texas Instruments, Jason Kridner
//
// Modified by Aditya Patadia, Octal Consulting LLP
var fs = require('fs');
var child_process = require('child_process');
var winston = require('winston');
var os = require('os');
var hw_oldkernel = require('./src/hw_oldkernel');
var hw_capemgr = require('./src/hw_capemgr');
var hw_simulator = require('./src/hw_simulator');
var bone = require('./src/bone');
var functions = require('./src/functions');
var serial = require('./src/serial');
var iic = require('./src/iic');
var my = require('./src/my');
var package_json = require('./package.json');
var g = require('./src/constants');
var fibers = my.require('fibers');
var epoll = my.require('epoll');

var debug;
if(process.env.DEBUG && process.env.DEBUG.indexOf("bone")!==-1){
    debug = true;
} else {
    debug = false;
}

// Detect if we are on a Beagle
var hw;
if(os.type() == 'Linux' || os.arch() == 'arm') {
    if(my.is_capemgr()) {
        hw = hw_capemgr;
        if(debug) winston.debug('Using CapeMgr interface');
    } else {
        hw = hw_oldkernel;
        if(debug) winston.debug('Using 3.2 kernel interface');
    }
} else {
    hw = hw_simulator;
    if(debug) winston.debug('Using simulator mode');
}

if(debug) {
    winston.remove(winston.transports.Console);
    winston.add(winston.transports.File, {
        filename: hw.logfile,
        level: 'warn'
    });
    winston.add(winston.transports.Console, {
        level: 'debug',
        colorize: true
    });
} else {
    winston.setLevels(winston.config.syslog.levels);
}

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
f.getPinMode = function(pin, callback) {
    if(typeof callback == 'undefined') {
        return(my.wait_for(f.getPinMode, arguments));
    }
    pin = my.getpin(pin);
    if(debug) winston.debug('getPinMode(' + pin.key + ');');
    var mode = {'pin': pin.key, 'name': pin.name};
    if(pin.options) mode.options = pin.options;

    // Get PWM settings if applicable
    if(
        (typeof pin.pwm != 'undefined')                 // pin has PWM capabilities
        && (typeof pwm[pin.pwm.name] != 'undefined')    // PWM used for this pin is enabled
        && (pin.key == pwm[pin.pwm.name].key)           // PWM is allocated for this pin
    ) {
        mode.pwm = hw.readPWMFreqAndValue(pin, pwm[pin.pwm.name]);
    }

    // Get GPIO settings if applicable
    if((typeof pin.gpio != 'undefined')) {
        var n = pin.gpio;
        mode.gpio = hw.readGPIODirection(n, gpio);
        if(typeof gpio[n] == 'undefined') {
            mode.gpio.allocated = false;
        } else {
            mode.gpio.allocated = true;
        }
    }

    // Get pinmux settings
    hw.readPinMux(pin, mode, callback);
};
f.getPinMode.args = ['pin', 'callback'];

f.pinMode = function(pin, direction, mux, pullup, slew, callback) {
    if(typeof callback == 'undefined') {
        return(my.wait_for(f.pinMode, arguments, 'value', true));
    }
    pin = my.getpin(pin);
    if(debug) winston.debug('pinMode(' + [pin.key, direction, mux, pullup, slew] + ');');
    if(direction == g.INPUT_PULLUP) pullup = 'pullup';
    pullup = pullup || ((direction == g.INPUT) ? 'pulldown' : 'disabled');
    slew = slew || 'fast';
    mux = (typeof mux != 'undefined') ? mux : 7; // default to GPIO mode
    var resp = {value: true};
    var template = 'bspm';
    var n = pin.gpio;
    
    if(
        direction == g.ANALOG_OUTPUT
        || mux == g.ANALOG_OUTPUT
        || (typeof pin.pwm != 'undefined' && mux == pin.pwm.muxmode)
    ) {
        if(
            (typeof pin.pwm == 'undefined') ||          // pin does not have PWM capability
            (typeof pin.pwm.muxmode == 'undefined')     // required muxmode is not provided
        ) {
            var err = 'pinMode only supports ANALOG_OUTPUT for PWM pins: ' + pin.key;
            winston.info(err);
            if(callback) callback({value:false, err:err});
            return;
        }
        direction = g.OUTPUT;
        mux = pin.pwm.muxmode;
        template = 'bspwm';
        pwm[pin.pwm.name] = {'key': pin.key, 'freq': 0};
    }
    
    if(!pin.mux) {
        if(debug) winston.debug('Invalid pin object for pinMode: ' + pin);
        throw('Invalid pin object for pinMode: ' + pin);
    }

    // Handle case where pin is allocated as a gpio-led
    if(pin.led) {
        if((direction != g.OUTPUT) || (mux != 7)) {
            resp.err = 'pinMode only supports GPIO output for LEDs: ' + pin.key;
            winston.info(resp.err);
            resp.value = false;
            if(callback) callback(resp);
            return;
        }

        resp = hw.setLEDPinToGPIO(pin, resp);
        if(typeof resp.err == 'undefined') {
            gpio[n] = true;
        }
        callback(resp);
        return;
    }

    // Figure out the desired value
    var pinData = my.pin_data(slew, direction, pullup, mux);

    // May be required: mount -t debugfs none /sys/kernel/debug
    hw.setPinMode(pin, pinData, template, resp, onSetPinMode);
    
    function onSetPinMode(x) {
        if(debug) winston.debug('returned from setPinMode');
        resp = x;
        if(typeof resp.err != 'undefined') {
            if(debug) winston.debug('Unable to configure mux for pin ' + pin + ': ' + resp.err);
            // It might work if the pin is already muxed to desired mode
            f.getPinMode(pin, pinModeTestMode);
        } else {
            pinModeTestGPIO();
        }
    }
    
    function pinModeTestMode(mode) {
        if(mode.mux != mux) {
            resp.value = false;
            winston.info(resp.err);
            delete gpio[n];
        }
        callback(resp);
    }
    
    function pinModeTestGPIO() {
        // Enable GPIO
        if(mux == 7) {
            // Export the GPIO controls
            resp = hw.exportGPIOControls(pin, direction, resp, onExport);
        } else {
            delete gpio[n];
            if(callback) callback(resp);
        }
    }
    
    function onExport(resp) {
        if(typeof resp.err != 'undefined') {
            if(typeof gpio[n] == 'undefined') {
                delete gpio[n];
            }
        } else {
            gpio[n] = true;
        }
        if(callback) callback(resp);
    }
};
f.pinMode.args = ['pin', 'direction', 'mux', 'pullup', 'slew', 'callback'];

f.digitalWrite = function(pin, value, callback) {
    if(typeof callback == 'undefined') {
        return(my.wait_for(f.digitalWrite, arguments, 'err', true));
    }
    var myCallback = function(resp) {
        if(callback) callback({'err': resp, 'complete':true});
    };
    pin = my.getpin(pin);
    if(debug) winston.debug('digitalWrite(' + [pin.key, value] + ');');
    value = parseInt(Number(value), 2) ? 1 : 0;

    hw.writeGPIOValue(pin, value, myCallback);
};
f.digitalWrite.args = ['pin', 'value', 'callback'];

f.digitalRead = function(pin, callback) {
    if(typeof callback == 'undefined') {
        return(my.wait_for(f.digitalRead, arguments, 'value'));
    }
    pin = my.getpin(pin);
    if(debug) winston.debug('digitalRead(' + [pin.key] + ');');
    var resp = {};
    if(typeof pin.ain != 'undefined') {
        f.analogRead(pin, analogCallback);
    } else {
        hw.readGPIOValue(pin, resp, callback);
    }

    function analogCallback(x) {
        x = analogValue(x);
        callback(x);
    }

    function analogValue(x) {
        if(typeof x.value == 'undefined') return;
        if(x.value > 0.5) {
            x.value = g.HIGH;
        } else {
            x.value = g.LOW;
        }
    }
};
f.digitalRead.args = ['pin', 'callback'];

f.analogRead = function(pin, callback) {
    if(typeof callback == 'undefined') {
        return(my.wait_for(f.analogRead, arguments, 'value'));
    }
    pin = my.getpin(pin);
    if(debug) winston.debug('analogRead(' + [pin.key] + ');');
    var resp = {};
    if(typeof pin.ain == 'undefined') {
        f.digitalRead(pin, callback);
    } else {
        if(!ain) {
            hw.enableAIN(onEnableAIN);
        } else {
            doAnalogRead();
        }
    }
    
    function onEnableAIN(x) {
        if(x.err) {
            resp.err = "Error enabling analog inputs: " + x.err;
            if(debug) winston.debug(resp.err);
            callback(resp);
            return;
        }
        ain = true;
        doAnalogRead();
    }
    
    function doAnalogRead() {
        hw.readAIN(pin, resp, callback);
    }
};
f.analogRead.args = ['pin', 'callback'];

f.shiftOut = function(dataPin, clockPin, bitOrder, val, callback) {
    if(typeof callback == 'undefined') {
        return(my.wait_for(f.shiftOut, arguments, 'err', true));
    }
    dataPin = my.getpin(dataPin);
    clockPin = my.getpin(clockPin);
    if(debug) winston.debug('shiftOut(' + [dataPin.key, clockPin.key, bitOrder, val] + ');');
    var i = 0;
    var bit;
    var clock = 0;
    next();

    function next(err) {
        if(debug) winston.debug('i = ' + i);
        if(debug) winston.debug('clock = ' + clock);
        if(err || i == 8) {
            callback({'err': err});
            return;
        }
        if(bitOrder == g.LSBFIRST) {
            bit = val & (1 << i);
        } else {
            bit = val & (1 << (7 - i));
        }
        if(clock === 0) {
            clock = 1;
            if(bit) {
                f.digitalWrite(dataPin, g.HIGH, next);
            } else {
                f.digitalWrite(dataPin, g.LOW, next);
            }
        } else if(clock == 1) {
            clock = 2;
            f.digitalWrite(clockPin, g.HIGH, next);
        } else if(clock == 2) {
            i++;
            clock = 0;
            f.digitalWrite(clockPin, g.LOW, next);
        }
    }
};
f.shiftOut.args = ['dataPin', 'clockPin', 'bitOrder', 'val', 'callback'];

f.attachInterrupt = function(pin, handler, mode, callback) {
    if(typeof callback == 'undefined') {
        return(my.wait_for(f.attachInterrupt, arguments, 'attached', true));
    }
    pin = my.getpin(pin);
    if(debug) winston.debug('attachInterrupt(' + [pin.key, handler, mode] + ');');
    var n = pin.gpio;
    var resp = {'pin':pin, 'attached': false};

    // Check if we don't have the required Epoll module
    if(!epoll.exists) {
        resp.err = 'attachInterrupt: requires Epoll module';
        if(debug) winston.debug(resp.err);
        callback(resp);
        return;
    }

    // Check if pin isn't already configured as GPIO
    if(typeof gpio[n] == 'undefined') {
        resp.err = 'attachInterrupt: pin ' + pin.key + ' not already configured as GPIO';
        if(debug) winston.debug(resp.err);
        resp.attached = false;
        resp.configured = false;
        callback(resp);
        return;
    }

    // Check if someone already has a handler configured
    if(typeof gpioInt[n] != 'undefined') {
    resp.err = 'attachInterrupt: pin ' + pin.key + ' already has an interrupt handler assigned';
    if(debug) winston.debug(resp.err);
        resp.attached = false;
        resp.configured = true;
        callback(resp);
        return;
    }

    var intHandler = function(err, fd, events) {
        var m = {};
        if(err) {
            m.err = err;
        }
        fs.readSync(gpioInt[n].valuefd, gpioInt[n].value, 0, 1, 0);
        m.pin = pin;
        m.value = parseInt(Number(gpioInt[n].value), 2);
        if(typeof handler =='function') m.output = handler(m);
        else m.output = {handler:handler};
        if(m.output && (typeof callback == 'function')) callback(m);
    };

    try {
        gpioInt[n] = hw.writeGPIOEdge(pin, mode);
        gpioInt[n].epoll = new epoll.Epoll(intHandler);
        fs.readSync(gpioInt[n].valuefd, gpioInt[n].value, 0, 1, 0);
        gpioInt[n].epoll.add(gpioInt[n].valuefd, epoll.Epoll.EPOLLPRI);
        resp.attached = true;
    } catch(ex) {
        resp.err = 'attachInterrupt: GPIO input file not opened: ' + ex;
        if(debug) winston.debug(resp.err);
    }
    callback(resp);
    return;
};
f.attachInterrupt.args = ['pin', 'handler', 'mode', 'callback'];

f.detachInterrupt = function(pin, callback) {
    if(typeof callback == 'undefined') {
        return(my.wait_for(f.detachInterrupt, arguments, 'detached', true));
    }
    pin = my.getpin(pin);
    if(debug) winston.debug('detachInterrupt(' + [pin.key] + ');');
    var n = pin.gpio;
    if(typeof gpio[n] == 'undefined' || typeof gpioInt[n] == 'undefined') {
        callback({'pin':pin, 'detached':false});
        return;
    }
    gpioInt[n].epoll.remove(gpioInt[n].valuefd);
    delete gpioInt[n];
    callback({'pin':pin, 'detached':true});
};
f.detachInterrupt.args = ['pin', 'callback'];

// See http://processors.wiki.ti.com/index.php/AM335x_PWM_Driver's_Guide
// That guide isn't useful for the new pwm_test interface
f.analogWrite = function(pin, value, freq, callback) {
    if(typeof callback == 'undefined') {
        return(my.wait_for(f.analogWrite, arguments, 'err', true));
    }
    pin = my.getpin(pin);
    if(debug) winston.debug('analogWrite(' + [pin.key,value,freq] + ');');
    freq = freq || 2000.0;
    var resp = {};

    // Make sure the pin has a PWM associated
    if(typeof pin.pwm == 'undefined') {
        resp.err = 'analogWrite: ' + pin.key + ' does not support analogWrite()';
        winston.error(resp.err);
        if(callback) callback(resp);
        return;
    }

    // Make sure there is no one else who has the PWM
    if(
        (typeof pwm[pin.pwm.name] != 'undefined')   // PWM needed by this pin is already allocated
         && (pin.key != pwm[pin.pwm.name].key)      // allocation is not by this pin
    ) {
        resp.err = 'analogWrite: ' + pin.key + ' requires pwm ' + pin.pwm.name +
            ' but it is already in use by ' + pwm[pin.pwm.name].key;
        winston.error(resp.err);
        if(callback) callback(resp);
        return;
    }

    // Enable PWM controls if not already done
    if(typeof pwm[pin.pwm.name] == 'undefined') {
        f.getPinMode(pin.key, onGetPinMode);
    } else {
        onPinMode();
    }
    
    function onGetPinMode(pinMode) {
        var slew = pinMode.slew || 'fast';
        var pullup = pinMode.pullup || 'disabled';
        f.pinMode(pin, g.ANALOG_OUTPUT, pin.pwm.muxmode, pullup, slew, onPinMode);
    }

    function onPinMode() {
        // Perform update
        resp = hw.writePWMFreqAndValue(pin, pwm[pin.pwm.name], freq, value, resp);
    
        // Save off the freq, value and PWM assignment
        pwm[pin.pwm.name].freq = freq;
        pwm[pin.pwm.name].value = value;
    
        // All done
        if(callback) callback(resp);
    }
};
f.analogWrite.args = ['pin', 'value', 'freq', 'callback'];

f.getEeproms = function(callback) {
    if(typeof callback == 'undefined') {
        return(my.wait_for(f.getEeproms, arguments));
    }
    var eeproms = {};
    eeproms = hw.readEeproms(eeproms);
    if(eeproms == {}) {
        if(debug) winston.debug('No valid EEPROM contents found');
    }
    callback(eeproms);
};
f.getEeproms.args = ['callback'];

f.readTextFile = function(filename, callback) {
    if(typeof callback == 'undefined') {
        return(my.wait_for(f.readTextFile, arguments, 'data'));
    }
    fs.readFile(filename, 'ascii', cb);
    
    function cb(err, data) {
        callback({'err':err, 'data':data});
    }
};
f.readTextFile.args = ['filename', 'callback'];

f.writeTextFile = function(filename, data, callback) {
    if(typeof callback == 'undefined') {
        return(my.wait_for(f.writeTextFile, arguments, 'err', true));
    }
    fs.writeFile(filename, data, 'ascii', cb);
    
    function cb(err) {
        callback({'err':err});
    }
};
f.writeTextFile.args = ['filename', 'data', 'callback'];

f.getPlatform = function(callback) {
    if(typeof callback == 'undefined') {
        return(my.wait_for(f.getPlatform, arguments));
    }
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
    callback(platform);
};
f.getPlatform.args = ['callback'];

f.echo = function(data, callback) {
    if(typeof callback == 'undefined') {
        return(my.wait_for(f.echo, arguments, 'data'));
    }
    winston.info(data);
    callback({'data': data});
};
f.echo.args = ['data', 'callback'];

f.setDate = function(date, callback) {
    if(typeof callback == 'undefined') {
        return(my.wait_for(f.setDate, arguments, 'error', true));
    }
    child_process.exec('date -s "' + date + '"', dateResponse);
    
    function dateResponse(error, stdout, stderr) {
        callback({'error': error, 'stdout':stdout, 'stderr':stderr});
    }
};
f.setDate.args = ['date', 'callback'];

f.delay = function(ms) {
    var fiber = fibers.current;
    if(typeof fiber == 'undefined') {
        winston.error('sleep may only be called within the setup or run functions');
        return;
    }
    setTimeout(function() {
        fiber.run();
    }, ms);
    fibers.yield();
};


// Exported variables
exports.bone = bone; // this likely needs to be platform and be detected
for(var x in f) {
    exports[x] = f[x];
}
for(var x in functions) {
    exports[x] = functions[x];
}
for(var x in serial) {
    exports[x] = serial[x];
}
for(var x in iic) {
    exports[x] = iic[x];
}
for(var x in g) {
    exports[x] = g[x];
}

var alreadyRan = false;
function run() {
    if(debug) winston.debug('Calling run()');
    if(alreadyRan) return(false);
    alreadyRan = true;
    // 'setup' and 'loop' are globals that may or may not be defined
    if(typeof global.setup == 'function' || typeof global.loop == 'function') {
        fibers(function() {
            if(typeof global.setup == 'function') {
                winston.debug('Running setup()');
                global.setup();
            }
            if(typeof global.loop == 'function') {
                if(debug) winston.debug('Starting loop()');
                while(1) {
                    global.loop();
                }
            }
        }).run();
    }
}
process.nextTick(run);

if(debug) winston.debug('index.js loaded');
