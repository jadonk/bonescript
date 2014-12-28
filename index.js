// Copyright (C) 2011 - Texas Instruments, Jason Kridner
//
// Modified by Aditya Patadia, Octal Consulting LLP
var fs = require('fs');
var child_process = require('child_process');
var winston = require('winston');
var os = require('os');
var pinmap = require('./src/pinmap');
var functions = require('./src/functions');
var serial = require('./src/serial');
var iic = require('./src/iic');
var bone = require('./src/bone');
var package_json = require('./package.json');
var g = require('./src/constants');
var epoll = bone.require('epoll');

winston.remove(winston.transports.Console);

var debug;
if(process.env.DEBUG && process.env.DEBUG.indexOf("bone")!==-1){
    debug = true;
    winston.add(winston.transports.Console, {
        level: 'debug',
        colorize: true
    });
} else {
    debug = false;
    winston.add(winston.transports.Console, {
        level: 'warn',
        colorize: true
    });
}


var f = {};

// Keep track of allocated resources
var gpio = {};
var gpioInt = {};
var pwm = {};

// Detect if we are on a Beagle
var hw = null;

if(os.type() == 'Linux' && os.arch() == 'arm') {
    if(!bone.is_cape_universal()) {
        winston.debug('Loading Universal Cape interface...');
        bone.create_dt_sync({"key":"d", "options":{}}, 0, "OBS_UNIV", true);
        if(!bone.is_audio_enable()){
            winston.debug('Loading AUDIO Cape...');
            bone.create_dt_sync({"key":"d", "options":{}}, 0, "OBS_AUDIO", true);
        }
        if(!bone.is_hdmi_enable()){
            winston.debug('Loading HDMI Cape...');
            bone.create_dt_sync({"key":"d", "options":{}}, 0, "OBS_HDMI", true);
        }
    }
    hw = require('./src/hw_universal');
    winston.debug('Using Universal Cape interface');
    
    winston.debug('Enabling analog inputs');
    hw.enableAIN();
} else {
    hw = require('./src/hw_simulator');
    winston.debug('Using simulator mode');
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
    if(typeof callback != 'function') {
        winston.error("getPinMode() requires callback function");
        return;
    }
    if(pin) {
        pin = bone.getpin(pin);
    } else {
        winston.error("Pin is not defined");
        throw("Invalid pin: " + pin);
    }
    winston.debug('getPinMode(' + pin.key + ');');
    var mode = {'pin': pin.key, 'name': pin.name};
    if(pin.options) mode.options = pin.options;

    // Get PWM settings if applicable
    if(
        (typeof pin.pwm != 'undefined') &&              // pin has PWM capabilities
        (typeof pwm[pin.pwm.name] != 'undefined') &&    // PWM used for this pin is enabled
        (pin.key == pwm[pin.pwm.name].key)              // PWM is allocated for this pin
    ) {
        hw.readPWMFreqAndValue(pin, pwm[pin.pwm.name], onReadPWM);
    } else {
        onReadPWM(null);
    }

    function onReadPWM(pwm){
        if(pwm){
            mode.pwm = pwm;
        }
        // Get GPIO settings if applicable
        if((typeof pin.gpio != 'undefined')) {
            var n = pin.gpio;
            hw.readGPIODirection(n, gpio, onReadGPIODirection);
        } else {
            hw.readPinState(pin, onReadPinState);
        }
    }

    function onReadGPIODirection(direction){
        mode.gpio = direction;
        var n = pin.gpio;
        if(typeof gpio[n] == 'undefined') {
            mode.gpio.allocated = false;
        } else {
            mode.gpio.allocated = true;
        }
        hw.readPinState(pin, onReadPinState);
    }

    function onReadPinState(state){
        mode.pinState = state;
        getPinMux();
    }

    function getPinMux(){
        // Get pinmux settings
        hw.readPinMux(pin, mode, callback);
    }
};
f.getPinMode.args = ['pin', 'callback'];

f.pinMode = function(givenPin, direction, callback) {
    if(arguments.length > 3 || (callback && typeof callback != 'function')){
        winston.error("As of version 0.4.0, pinMode function takes only 3 arguments (pin, mode, callback). " +
        "This function is now fully async so we recommend using callback to know completion of this funciton.");
        throw("pinMode arguments are not valid.");
    }

    var pin = bone.getpin(givenPin);
    var resp = {value: true};
    var n = pin.gpio;
    
    winston.debug('pinMode(' + [pin.key, direction] + ');');

    if(direction == g.INPUT_PULLUP){
        mode = "gpio_pu";
        direction = g.INPUT;
    } else if(direction == g.INPUT_PULLDOWN){
        mode = "gpio_pd";
        direction = g.INPUT;
    } else if(direction == g.INPUT || direction == g.OUTPUT) {
        mode = "gpio";
    } else if(direction == g.ANALOG_OUTPUT) {
        if(typeof pin.pwm == 'undefined'){
            var err = 'pinMode supports ANALOG_OUTPUT only for PWM pins: ' + pin.key;
            winston.error(err);
            if(typeof callback == 'function') callback({value:false, err:err},givenPin);
            return;
        }
        mode = "pwm";
        pwm[pin.pwm.name] = {'key': pin.key, 'freq': 0};
        direction = g.OUTPUT;
    } else {
        throw('Invalid mode value provided to pinMode function.');
    }
    
    if(!pin.mux) {
        winston.debug('Invalid pin object for pinMode: ' + pin);
        throw('Invalid pin object for pinMode: ' + pin);
    }

    // Handle case where pin is allocated as a gpio-led
    if(pin.led) {
        if((direction != g.OUTPUT)) {
            resp.err = 'pinMode only supports GPIO output for LEDs: ' + pin.key;
            winston.error(resp.err);
            resp.value = false;
            if(typeof callback == 'function') callback(resp,givenPin);
            return;
        }

        hw.setLEDPinToGPIO(pin, resp, onSetLEDPin);
        return;
    }

    function onSetLEDPin(resp){
        if(typeof resp.err == 'undefined') {
            gpio[n] = true;
        }
        if(typeof callback == 'function') callback(resp,givenPin);
    }

    // May be required: mount -t debugfs none /sys/kernel/debug
    hw.setPinMode(pin, mode, resp, onSetPinMode);
    
    function onSetPinMode(x) {
        winston.debug('returned from setPinMode');
        resp = x;
        if(typeof resp.err != 'undefined') {
            winston.error('Unable to configure mux for pin ' + pin + ': ' + resp.err);
            // It might work if the pin is already muxed to desired mode
            f.getPinMode(pin, pinModeTestMode);
        } else {
            pinModeTestGPIO();
        }
    }

    function pinModeTestMode(mod) {
        if(mod.pinState != mode) {
            resp.value = false;
            winston.error(resp.err);
            delete gpio[n];
        }
        if(callback) callback(resp,givenPin);
    }
    
    function pinModeTestGPIO() {
        // Enable GPIO
        if(mode == "gpio" || mode == "gpio_pu" || mode == "gpio_pd") {
            // Export the GPIO controls
            resp = hw.exportGPIOControls(pin, direction, resp, onExport);
        } else {
            delete gpio[n];
            if(callback) callback(resp,givenPin);
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
        if(callback) callback(resp,givenPin);
    }
};
f.pinMode.args = ['pin', 'direction', 'callback'];

f.digitalWrite = function(pin, value, callback) {
    if(pin) {
        pin = bone.getpin(pin);
    } else {
        winston.error("Pin is not defined");
        throw("Invalid pin: " + pin);
    }
    winston.debug('digitalWrite(' + [pin.key, value] + ');');
    value = parseInt(Number(value), 2) ? 1 : 0;

    if(typeof callback == 'undefined') {
        hw.writeGPIOValueSync(pin, value);
    } else {
        hw.writeGPIOValue(pin, value, onWriteGPIO);
    }

    function onWriteGPIO(resp) {
        if(callback) callback({'err': resp, 'complete':true});
    }
};
f.digitalWrite.args = ['pin', 'value', 'callback'];

f.digitalRead = function(pin, callback) {
    if(typeof callback == 'undefined') {
        winston.error("digitalRead() requires callback");
        return;
    }
    pin = bone.getpin(pin);
    winston.debug('digitalRead(' + [pin.key] + ');');
    var resp = {};
    if(typeof pin.ain != 'undefined') {
        f.analogRead(pin, analogCallback);
    } else {
        hw.readGPIOValue(pin, resp, callback);
    }

    function analogCallback(x) {
        x = analogValue(x);
        if(callback) callback(x);
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
        winston.error("analogRead() requires callback");
        return;
    }
    pin = bone.getpin(pin);
    winston.debug('analogRead(' + [pin.key] + ');');
    var resp = {};
    if(typeof pin.ain == 'undefined') {
        f.digitalRead(pin, callback);
    } else {
        hw.readAIN(pin, resp, callback);
    }
};
f.analogRead.args = ['pin', 'callback'];

f.stopAnalog = function(pin, callback){
    pin = bone.getpin(pin);
    if(typeof pin.pwm == 'undefined') {
        resp.err = 'stopAnalog: ' + pin.key + ' does not support stopAnalog()';
        winston.error(resp.err);
        if(callback) callback(resp);
        return;
    }
    // Enable PWM controls if not already done
    if(typeof pwm[pin.pwm.name] == 'undefined') {
        f.pinMode(pin, g.ANALOG_OUTPUT, onPinMode);
    } else {
        onPinMode();
    }

    function onPinMode() {
        hw.stopPWM(pin, pwm[pin.pwm.name],callback);
    }
};
f.stopAnalog.args = ['pin', 'callback'];

f.startAnalog = function(pin, callback){
    pin = bone.getpin(pin);
    if(typeof pin.pwm == 'undefined') {
        resp.err = 'startAnalog: ' + pin.key + ' does not support startAnalog()';
        winston.error(resp.err);
        if(callback) callback(resp);
        return;
    }
    // Enable PWM controls if not already done
    if(typeof pwm[pin.pwm.name] == 'undefined') {
        f.pinMode(pin, g.ANALOG_OUTPUT, onPinMode);
    } else {
        onPinMode();
    }

    function onPinMode() {
        hw.startPWM(pin, pwm[pin.pwm.name],callback);
    }
};
f.startAnalog.args = ['pin', 'callback'];

// See http://processors.wiki.ti.com/index.php/AM335x_PWM_Driver's_Guide
// That guide isn't useful for the new pwm_test interface
f.analogWrite = function(pin, value, freq, callback) {
    pin = bone.getpin(pin);
    winston.debug('analogWrite(' + [pin.key,value,freq] + ');');
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
        (typeof pwm[pin.pwm.name] != 'undefined') &&    // PWM needed by this pin is already allocated
        (pin.key != pwm[pin.pwm.name].key)              // allocation is not by this pin
    ) {
        resp.err = 'analogWrite: ' + pin.key + ' requires pwm ' + pin.pwm.name +
            ' but it is already in use by ' + pwm[pin.pwm.name].key;
        winston.error(resp.err);
        if(callback) callback(resp);
        return;
    }

    // Enable PWM controls if not already done
    if(typeof pwm[pin.pwm.name] == 'undefined') {
        f.pinMode(pin, g.ANALOG_OUTPUT, onPinMode);
    } else {
        onPinMode();
    }

    function onPinMode() {
        // Perform update
        hw.writePWMFreqAndValue(pin, pwm[pin.pwm.name], freq, value, resp, onWritePWM);
    }

    function onWritePWM(resp){
        // Save off the freq, value and PWM assignment
        pwm[pin.pwm.name].freq = freq;
        pwm[pin.pwm.name].value = value;

        // All done
        if(callback) callback(resp);
    }
};
f.analogWrite.args = ['pin', 'value', 'freq', 'callback'];

f.shiftOut = function(dataPin, clockPin, bitOrder, val, callback) {
    dataPin = bone.getpin(dataPin);
    clockPin = bone.getpin(clockPin);
    winston.debug('shiftOut(' + [dataPin.key, clockPin.key, bitOrder, val] + ');');
    var i = 0;
    var bit;
    var clock = 0;
    next();

    function next(err) {
        winston.debug('i = ' + i);
        winston.debug('clock = ' + clock);
        if(err || i == 8) {
            if(callback) callback({'err': err});
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
    pin = bone.getpin(pin);
    winston.debug('attachInterrupt(' + [pin.key, handler, mode] + ');');
    var n = pin.gpio;
    var resp = {'pin':pin, 'attached': false};

    // Check if we don't have the required Epoll module
    if(!epoll.exists) {
        resp.err = 'attachInterrupt: requires Epoll module';
        winston.error(resp.err);
        if(callback) callback(resp);
        return;
    }

    // Check if pin isn't already configured as GPIO
    if(typeof gpio[n] == 'undefined') {
        resp.err = 'attachInterrupt: pin ' + pin.key + ' not already configured as GPIO';
        winston.error(resp.err);
        resp.attached = false;
        resp.configured = false;
        if(callback) callback(resp);
        return;
    }

    // Check if someone already has a handler configured
    if(typeof gpioInt[n] != 'undefined') {
        resp.err = 'attachInterrupt: pin ' + pin.key + ' already has an interrupt handler assigned';
        winston.error(resp.err);
        resp.attached = false;
        resp.configured = true;
        if(callback) callback(resp);
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
        winston.error(resp.err);
    }
    if(callback) callback(resp);
    return;
};
f.attachInterrupt.args = ['pin', 'handler', 'mode', 'callback'];

f.detachInterrupt = function(pin, callback) {
    pin = bone.getpin(pin);
    winston.debug('detachInterrupt(' + [pin.key] + ');');
    var n = pin.gpio;
    if(typeof gpio[n] == 'undefined' || typeof gpioInt[n] == 'undefined') {
        if(typeof callback == 'function') callback({'pin':pin, 'detached':false});
        return;
    }
    gpioInt[n].epoll.remove(gpioInt[n].valuefd);
    delete gpioInt[n];
    if(typeof callback == 'function') callback({'pin':pin, 'detached':true});
};
f.detachInterrupt.args = ['pin', 'callback'];

f.getEeproms = function(callback) {
    if(typeof callback == 'undefined') {
        winston.error("getEeproms requires callback");
        return;
    }
    var eeproms = {};
    eeproms = hw.readEeproms(eeproms);
    if(eeproms == {}) {
        winston.debug('No valid EEPROM contents found');
    }
    if(callback) callback(eeproms);
};
f.getEeproms.args = ['callback'];

f.readTextFile = function(filename, callback) {
    if(typeof callback == 'undefined') {
        winston.error("readTextFile requires callback");
        return;
    }
    fs.readFile(filename, 'ascii', cb);
    
    function cb(err, data) {
        if(callback) callback({'err':err, 'data':data});
    }
};
f.readTextFile.args = ['filename', 'callback'];

f.writeTextFile = function(filename, data, callback) {
    if(typeof callback == 'undefined') {
        winston.error("writeTextFile requires callback");
        return;
    }
    fs.writeFile(filename, data, 'ascii', cb);
    
    function cb(err) {
        if(callback) callback({'err':err});
    }
};
f.writeTextFile.args = ['filename', 'data', 'callback'];

f.getPlatform = function(callback) {
    if(typeof callback == 'undefined') {
        winston.error("getPlatform requires callback");
        return;
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
    if(callback) callback(platform);
};
f.getPlatform.args = ['callback'];

f.echo = function(data, callback) {
    if(typeof callback == 'undefined') {
        winston.error("echo requires callback");
        return;
    }
    winston.info(data);
    if(callback) callback({'data': data});
};
f.echo.args = ['data', 'callback'];

f.setDate = function(date, callback) {
    child_process.exec('date -s "' + date + '"', dateResponse);
    
    function dateResponse(error, stdout, stderr) {
        if(typeof callback == 'function') {
            callback({'error': error, 'stdout':stdout, 'stderr':stderr});
        }
    }
};
f.setDate.args = ['date', 'callback'];

f.startWatchdog = hw.startWatchdog;

f.stopWatchdog = hw.stopWatchdog;

// Exported variables
exports.bone = pinmap; // this likely needs to be platform and be detected
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

winston.debug('index.js loaded');
