// Copyright (C) 2011 - Texas Instruments, Jason Kridner
//
// Modified by Aditya Patadia, Octal Consulting LLP
var fs = require('fs');
var child_process = require('child_process');
var debug = require('debug')('bone');
var os = require('os');
var epoll = require('epoll');
var verror = require("verror");
var pinmap = require('./lib/pinmap');
var serial = require('./lib/serial');
var i2c = require('./lib/i2c');
var bone = require('./lib/bone');
var package_json = require('./package.json');
var g = require('./lib/constants');

var f = {};

// Keep track of allocated resources
var gpio = {};
var gpioInt = {};
var pwm = {};

// Detect if we are on a Beagle
var hw = null;

if (os.type() == 'Linux' && os.arch() == 'arm') {
    if (!bone.is_cape_universal()) {
        debug('Loading Universal Cape interface...');
        bone.create_dt_sync("OBS_UNIV");
        if (!bone.is_audio_enable()) {
            debug('Loading AUDIO Cape...');
            bone.create_dt_sync("OBS_AUDIO");
        }
        if (!bone.is_hdmi_enable()) {
            debug('Loading HDMI Cape...');
            bone.create_dt_sync("OBS_HDMI");
        }
    }
    debug('Using Universal Cape interface');
    hw = require('./lib/hw_universal');

    debug('Enabling analog inputs');
    hw.analog.enable();
} else {
    hw = require('./lib/hw_simulator');
    debug('Using simulator mode');
}


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
    if (typeof callback != 'function') {
        throw new verror("getPinMode() requires callback function");
    }
    if (pin) {
        pin = bone.getpin(pin);
    } else {
        throw new verror("Please provide valid pin as first argument");
    }
    debug('getPinMode(' + pin.key + ')');
    var mode = {
        'pin': pin.key,
        'name': pin.name
    };
    if (pin.modes) mode.modes = pin.modes;

    // Get PWM settings if applicable
    if (
        (typeof pin.pwm != 'undefined') && // pin has PWM capabilities
        (typeof pwm[pin.pwm.name] != 'undefined') && // PWM used for this pin is enabled
        (pin.key == pwm[pin.pwm.name].key) // PWM is allocated for this pin
    ) {
        hw.pwm.readFreqAndValue(pin, pwm[pin.pwm.name], onReadPWM);
    } else {
        onReadPWM(null);
    }

    function onReadPWM(err, pwm) {
        if (err) {
            console.error(err.message);
            callback(err, null);
            return;
        }
        if (pwm) {
            mode.pwm = pwm;
        }
        // Get GPIO settings if applicable
        if ((typeof pin.gpio != 'undefined')) {
            var n = pin.gpio;
            hw.digital.readDirection(n, onReadGPIODirection);
        } else {
            hw.readPinState(pin, onReadPinState);
        }
    }

    function onReadGPIODirection(err, direction) {
        if (err) {
            console.error(error.message);
            callback(err, null);
            return;
        }
        mode.gpio = direction;
        var n = pin.gpio;
        if (typeof gpio[n] == 'undefined') {
            mode.gpio.allocated = false;
        } else {
            mode.gpio.allocated = true;
        }
        hw.readPinState(pin, onReadPinState);
    }

    function onReadPinState(err, state) {
        if (err) {
            console.error(err.message);
            calback(err, null);
            return;
        }
        mode.pinState = state;
        callback(null, mode);
    }
};

f.pinMode = function(givenPin, mode, callback) {
    if (!callback) {
        console.warn("As of version 0.4.0, pinMode function is fully async and we recommend passing " +
            "a callback function as third argument to know completion of pinMode function." +
            "v1.0.0 introduced 'pinModeSync' function. You can use it synchronously perform pinMode.");
    }

    if (arguments.length > 3 || (callback && typeof callback != 'function')) {
        console.error("As of version 0.4.0, pinMode function takes only 3 arguments (pin, mode, callback). " +
            "This function is now fully async so we recommend using callback to know completion of this funciton.");
        throw new verror("pinMode arguments are not valid.");
    }

    var pin = bone.getpin(givenPin);
    var n = pin.gpio;
    var direction;
    var err;

    debug('pinMode(' + [pin.key, mode] + ');');

    if (mode == g.INPUT_PULLUP) {
        direction = g.INPUT;
    } else if (mode == g.INPUT_PULLDOWN) {
        direction = g.INPUT;
    } else if (mode == g.INPUT || mode == g.OUTPUT) {
        direction = mode;
        mode = "gpio";
    } else if (mode == g.ANALOG_OUTPUT) {
        if (typeof pin.pwm == 'undefined') {
            err = new verror('BeagleBone does not allow ANALOG_OUTPUT for pin: ' + pin.key);
            console.error(err.message);
            if (typeof callback == 'function') callback(err, null);
            return;
        }
        pwm[pin.pwm.name] = {
            'key': pin.key,
            'freq': 0
        };
        direction = g.OUTPUT;
    } else {
        err = new verror("Invalid mode supplied for pin: " + givenPin + ". Only following modes are supported: " + pin.modes);
        console.error(err.message);
        if (typeof callback == 'function') callback(err, null);
        return;
    }

    // Handle case where pin is allocated as a gpio-led
    if (pin.led) {
        if (direction != g.OUTPUT) {
            err = new verror('pinMode only supports GPIO output for LED pin: ' + pin.key);
            console.error(err.message);
            if (typeof callback == 'function') callback(err, null);
            return;
        }

        hw.digital.setLEDPinToGPIO(pin, onSetLEDPin);

        return; // since nothing to do more for LED pins
    }

    function onSetLEDPin(err) {
        if (err) {
            console.error(err.message);
            if (typeof callback == 'function') callback(err, null);
        } else {
            gpio[n] = true;
            if (typeof callback == 'function') callback(null, givenPin);
        }
    }

    // May be required: mount -t debugfs none /sys/kernel/debug
    hw.setPinMode(pin, mode, onSetPinMode);

    function onSetPinMode(err) {
        debug('returned from setPinMode');
        if (err) {
            err = new verror(err, 'Unable to configure mux for pin ' + pin);
            console.error(err.message);
            // It might work if the pin is already muxed to desired mode
            if (callback) callback(err, null);
        } else {
            pinModeTestGPIO();
        }
    }

    function pinModeTestGPIO() {
        // Enable GPIO
        if (mode == "gpio" || mode == "gpio_pu" || mode == "gpio_pd") {
            // Export the GPIO controls
            resp = hw.digital.exportControls(pin, direction, onExport);
        } else {
            delete gpio[n];
            if (callback) callback(null, givenPin);
        }
    }

    function onExport(err) {
        if (err) {
            console.error(err.message);
            delete gpio[n];
            if (callback) callback(err, null);
        } else {
            gpio[n] = true;
            if (callback) callback(null, givenPin);
        }
    }
};

f.pinModeSync = function(pin, mode) {

    pin = bone.getpin(pin);
    var n = pin.gpio;
    var direction;
    var err;
    var resp;

    debug('pinModeSync(' + [pin.key, mode] + ');');

    if (mode == g.INPUT_PULLUP) {
        direction = g.INPUT;
    } else if (mode == g.INPUT_PULLDOWN) {
        direction = g.INPUT;
    } else if (mode == g.INPUT || mode == g.OUTPUT) {
        direction = mode;
        mode = "gpio";
    } else if (mode == g.ANALOG_OUTPUT) {
        if (typeof pin.pwm == 'undefined') {
            err = new verror('BeagleBone does not allow ANALOG_OUTPUT for pin: ' + pin.key);
            console.error(err.message);
            return;
        }
        pwm[pin.pwm.name] = {
            'key': pin.key,
            'freq': 0
        };
        direction = g.OUTPUT;
    } else {
        throw new verror("Invalid mode supplied for pin: " + givenPin + ". Only following modes are supported: " + pin.modes);
    }

    // Handle case where pin is allocated as a gpio-led
    if (pin.led) {
        if (direction != g.OUTPUT) {
            err = new verror('pinMode only supports GPIO output for LED pin: ' + pin.key);
            console.error(err.message);
            if (typeof callback == 'function') callback(err, null);
            return;
        }

        resp = hw.digital.setLEDPinToGPIOSync(pin);
        if (resp === true) {
            gpio[n] = true;
            return true;
        } else {
            console.error(resp.message);
        }

        return false; // since nothing to do more for LED pins
    }

    // May be required: mount -t debugfs none /sys/kernel/debug
    resp = hw.setPinModeSync(pin, mode);

    debug('done from setPinModeSync');

    if (resp === true) {
        return pinModeTestGPIO();
    } else {
        console.error(resp.message);
        return false;
    }

    function pinModeTestGPIO() {
        // Enable GPIO
        if (mode == "gpio" || mode == "gpio_pu" || mode == "gpio_pd") {
            // Export the GPIO controls
            resp = hw.digital.exportControlsSync(pin, direction);
            gpio[n] = true;
        } else {
            delete gpio[n];
        }
        return true;
    }
};

f.digitalWrite = function(pin, value, callback) {
    if (pin) {
        pin = bone.getpin(pin);
    } else {
        throw new verror("Provide pin as first argument to digitalWrite");
    }
    debug('digitalWrite(' + [pin.key, value] + ');');
    value = parseInt(Number(value), 2) ? 1 : 0;

    hw.digital.write(pin, value, callback);
};

f.digitalWriteSync = function(pin, value, callback) {
    if (pin) {
        pin = bone.getpin(pin);
    } else {
        throw new verror("Provide pin as first argument to digitalWrite");
    }
    debug('digitalWriteSync(' + [pin.key, value] + ');');
    value = parseInt(Number(value), 2) ? 1 : 0;

    hw.digital.writeSync(pin, value);
};


f.digitalRead = function(pin, callback) {
    if (typeof callback != 'function') {
        throw new verror("digitalRead() requires callback function");
    }
    pin = bone.getpin(pin);
    debug('digitalRead(' + [pin.key] + ');');

    if (typeof pin.ain != 'undefined') {
        f.analogRead(pin, analogCallback);
    } else {
        hw.digital.read(pin, callback);
    }

    function analogCallback(err, value) {
        if (err) {
            console.error(err.message);
            callback(err, null);
        } else {
            value = analogValue(value);
            callback(null, value);
        }
    }

    function analogValue(value) {
        if (value > 0.5) {
            value = g.HIGH;
        } else {
            value = g.LOW;
        }
        return value;
    }
};


f.analogRead = function(pin, callback) {
    if (typeof callback != 'function') {
        throw new verror("analogRead() requires callback function");
    }
    pin = bone.getpin(pin);
    debug('analogRead(' + [pin.key] + ');');

    if (typeof pin.ain == 'undefined') {
        f.digitalRead(pin, callback);
    } else {
        hw.analog.read(pin, callback);
    }
};


f.stopAnalog = function(pin, callback) {
    pin = bone.getpin(pin);
    if (typeof pin.pwm == 'undefined') {
        throw new verror(pin.key + ' does not support stopAnalog()');
    }
    // Enable PWM controls if not already done
    if (typeof pwm[pin.pwm.name] == 'undefined') {
        f.pinMode(pin, g.ANALOG_OUTPUT, onPinMode);
    } else {
        onPinMode();
    }

    function onPinMode() {
        hw.pwm.stop(pin, pwm[pin.pwm.name], callback);
    }
};


f.startAnalog = function(pin, callback) {
    pin = bone.getpin(pin);
    if (typeof pin.pwm == 'undefined') {
        throw new verror(pin.key + ' does not support startAnalog()');
    }
    // Enable PWM controls if not already done
    if (typeof pwm[pin.pwm.name] == 'undefined') {
        f.pinMode(pin, g.ANALOG_OUTPUT, onPinMode);
    } else {
        onPinMode();
    }

    function onPinMode() {
        hw.pwm.start(pin, pwm[pin.pwm.name], callback);
    }
};


// See http://processors.wiki.ti.com/index.php/AM335x_PWM_Driver's_Guide
// That guide isn't useful for the new pwm_test interface
f.analogWrite = function(pin, value, freq, callback) {
    pin = bone.getpin(pin);
    debug('analogWrite(' + [pin.key, value, freq] + ');');
    freq = freq || 2000.0;
    var resp = {};

    // Make sure the pin has a PWM associated
    if (typeof pin.pwm == 'undefined') {
        throw new verror(pin.key + ' does not support analogWrite()');
    }

    // Make sure there is no one else who has the PWM
    if (
        (typeof pwm[pin.pwm.name] != 'undefined') && // PWM needed by this pin is already allocated
        (pin.key != pwm[pin.pwm.name].key) // allocation is not by this pin
    ) {
        var err = 'analogWrite: ' + pin.key + ' requires pwm ' + pin.pwm.name +
            ' but it is already in use by ' + pwm[pin.pwm.name].key;
        err = new verror(err);
        console.error(err.message);
        if (typeof callback == 'function') callback(err);
        return;
    }

    // Enable PWM controls if not already done
    if (typeof pwm[pin.pwm.name] == 'undefined') {
        f.pinMode(pin, g.ANALOG_OUTPUT, onPinMode);
    } else {
        onPinMode();
    }

    function onPinMode() {
        // Perform update
        hw.pwm.writeFreqAndValue(pin, pwm[pin.pwm.name], freq, value, onWritePWM);
    }

    function onWritePWM(err) {
        // Save off the freq, value and PWM assignment
        if (err) {
            err = new verror(err, "There was an error writing analog value");
            callback(err);
        } else {
            pwm[pin.pwm.name].freq = freq;
            pwm[pin.pwm.name].value = value;

            // All done
            if (callback) callback(null);
        }
    }
};


f.shiftOut = function(dataPin, clockPin, bitOrder, val, callback) {
    dataPin = bone.getpin(dataPin);
    clockPin = bone.getpin(clockPin);
    debug('shiftOut(' + [dataPin.key, clockPin.key, bitOrder, val] + ');');
    var i = 0;
    var bit;
    var clock = 0;
    next();

    function next(err) {
        debug('i = ' + i);
        debug('clock = ' + clock);
        if (err || i == 8) {
            if (callback) callback({
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
};


f.attachInterrupt = function(pin, mode, handler, callback) {
    pin = bone.getpin(pin);
    debug('attachInterrupt(' + [pin.key, handler, mode] + ');');
    var n = pin.gpio;
    var err;

    /* Check if we don't have the required Epoll module
    if(!epoll.exists) {
        resp.err = 'attachInterrupt: requires Epoll module';
        console.error(resp.err);
        if(callback) callback(resp);
        return;
    }
    */

    // Check if pin isn't already configured as GPIO
    if (typeof gpio[n] == 'undefined') {
      debug( 'pin ' + pin.key + ' not already configured as GPIO. Configuring..');
      f.pinModeSync(pin, g.INPUT);
    }

    if (typeof handler != 'function') {
        err = new verror('attachInterrupt: handler argument must be supplied and it should be a function');
        console.error(err.message);
        if (callback) callback(err, null);
        return;
    }

    if (mode != g.RISING && mode != g.FALLING && mode != g.CHANGE) {
        err = new verror('attachInterrupt: mode must be "rising", "falling" or "both". Invalid mode argument');
        console.error(err.message);
        if (callback) callback(err, null);
        return;
    }

    // Check if someone already has a handler configured
    if (typeof gpioInt[n] != 'undefined') {
        err = new verror('attachInterrupt: pin ' + pin.key + ' already has an interrupt handler assigned');
        console.error(err.message);
        if (callback) callback(err);
        return;
    }

    var intHandler = function(err, fd, events) {
        if (err) {
            err = new verror(err, "Error during interrupt handler execution");
            handler(err, null);
            return;
        }
        var m = {};
        fs.readSync(gpioInt[n].valuefd, gpioInt[n].value, 0, 1, 0);
        m.pin = pin;
        m.value = parseInt(Number(gpioInt[n].value), 2);
        if (typeof handler == 'function') handler(null, m);
    };

    try {
        gpioInt[n] = hw.digital.writeEdge(pin, mode);
        gpioInt[n].epoll = new epoll.Epoll(intHandler);
        fs.readSync(gpioInt[n].valuefd, gpioInt[n].value, 0, 1, 0);
        gpioInt[n].epoll.add(gpioInt[n].valuefd, epoll.Epoll.EPOLLPRI);
        if (callback) callback(null);
    } catch (ex) {
        err = new verror(ex, 'attachInterrupt: GPIO input file not opened');
        console.error(err.message);
        if (callback) callback(err);
    }
};


f.detachInterrupt = function(pin, callback) {
    pin = bone.getpin(pin);
    debug('detachInterrupt(' + [pin.key] + ');');
    var n = pin.gpio;
    var err;
    if (typeof gpio[n] == 'undefined' || typeof gpioInt[n] == 'undefined') {
        err = new verror("Interrupt not attached with the pin. Nothing detached");
        if (typeof callback == 'function') callback(err);
        return;
    }
    gpioInt[n].epoll.remove(gpioInt[n].valuefd).close();
    delete gpioInt[n];
    if (typeof callback == 'function') callback(null);
};


f.getEeproms = function(callback) {
    if (typeof callback != 'function') {
        console.error("getEeproms requires callback function");
        return;
    }
    var eeproms = {};
    eeproms = hw.readEeproms(eeproms);
    if (eeproms == {}) {
        debug('No valid EEPROM contents found');
    }
    if (callback) callback(null, eeproms);
};


f.getPlatform = function(callback) {
    if (typeof callback != 'function') {
        throw new verror("getPlatform requires callback function");
    }
    var platform = {
        'platform': pinmap,
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
    if (callback) callback(null, platform);
};


f.setDate = function(date, callback) {
    child_process.exec('date -s "' + date + '"', dateResponse);

    function dateResponse(err, stdout, stderr) {
        if (err) {
            err = new verror(err);
            if (callback) callback(err);
        } else {
            if (callback) callback(null, {
                'stdout': stdout,
                'stderr': stderr
            });
        }
    }
};


f.watchdog = hw.watchdog;

// Exported variables
f.pinmap = pinmap;

f.serial = serial;

f.serialOpen = function() {
    console.error("serialOpen and all related functions are removed as of v1.0.0. Please use serial.open and refer " +
        "to README of OctalBoneScript for more information");
};

f.i2c = i2c;

f.i2cOpen = function() {
    console.error("i2cOpen and all related functions are removed as of v1.0.0. Please use i2c.open and refer " +
        "to README of OctalBoneScript for more information");
};

for (var x in g) {
    f[x] = g[x];
}

module.exports = f;

debug('index.js loaded');
