// Copyright (C) 2011 - Texas Instruments, Jason Kridner
//
//
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

var debug = process.env.DEBUG ? true : false;

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
    winston.add(winston.transports.File, {
        filename: hw.logfile,
        level: 'warn'
    });
} else {
    winston.setLevels(winston.config.syslog.levels);
}

if(debug) winston.debug('index.js loaded');

// Define major BoneScript function call parameters
var f = {
    getPlatform: {
        args: [
            { name: 'callback', required: true }
        ]
    },
    pinMode: {
        args: [
            { name: 'pin', required: true },
            { name: 'direction', required: true },
            { name: 'mux', required: false, value: 7 },
            { name: 'pullup', required: false },
            { name: 'slew', required: false, value: 'fast' },
            { name: 'callback', required: false }
        ],
        retval: { name: 'success', type: typeof false },
        callback: {
            args: [
                {
                    name: 'retval', type: typeof {},
                    members: [
                        {
                            name: 'value', type: typeof false,
                            description: 'true on success'
                        }, {
                            name: 'err', type: typeof '',
                            description: 'error status message'
                        }
                    ]
                }
            ] 
        }
    },
    getPinMode: {
        args: [
            { name: 'pin', required: true },
            { name: 'callback', required: true }
        ],
        retval: {
            name: 'mode', type: typeof {},
            members: [
                {
                    name: 'mux', type: typeof 0,
                    description: 'index of mux mode'
                }, {
                    name: 'options', type: typeof [],
                    description: 'array of mode names'
                }, {
                    name: 'slew', type: typeof '',
                    description: "'fast' or 'slow'"
                }, {
                    name: 'rx', type: typeof '',
                    description: "'enabled' or 'disabled'"
                }, {
                    name: 'pullup', type: typeof '',
                    description: "'disabled', 'pullup' or 'pulldown'"
                }, {
                    name: 'pin', type: typeof '',
                    description: 'key string for pin'
                }, {
                    name: 'name', type: typeof '',
                    description: 'pin name'
                }, {
                    name: 'pwm', type: typeof {},
                    description: 'object if pwm enabled, undefined otherwise',
                    members: [
                        {
                            name: 'freq', type: typeof 0,
                            description: 'frequency of PWM'
                        }, {
                            name: 'value', type: typeof 0,
                            description: 'duty cycle of PWM as number between 0 and 1'
                        }
                    ]
                }, {
                    name: 'gpio',
                    type: typeof {},
                    description: 'object if GPIO enabled, otherwise undefined',
                    members: [
                        {
                            name: 'active', type: typeof false,
                            description: 'GPIO is enabled by the kernel'
                        }, {
                            name: 'allocated', type: typeof false,
                            description: 'boolean for if it is allocated by this application'
                        }, {
                            name: 'direction', type: typeof '',
                            description: "'in' or 'out' (allocated might be false)"
                        }
                    ]
                }
            ]
        },
        callback: { args: [ { name: 'retval' } ] }
    },
    digitalWrite: {
        args: [
            { name: 'pin', required: true },
            { name: 'value', required: true },
            { name: 'callback', required: false }
        ],
        retval: { name: 'err', type: typeof '' },
        callback: { }
    },
    digitalRead: {
        args: [
            {
                name: 'pin', required: true
            }, {
                name: 'callback', required: true
            }
        ],
        retval: {
            name: 'value', type: typeof 0
        },
        callback: {
            args: [
            ]
        }
    },
    shiftOut: {
        args: [
            {
                name: 'dataPin', required: true
            }, {
                name: 'clockPin', required: true
            }, {
                name: 'bitOrder',
            }, {
                name: 'val', required: true
            }, {
                name: 'callback'
            }
        ],
        retval: {
        }
    },
    analogWrite: {
        args: [
            {
                name: 'pin', required: true
            }, {
                name: 'value', required: true
            }, {
                name: 'freq', required: false
            }, {
                name: 'callback', required: false
            }
        ],
        retval: {
        }
    },
    analogRead: {
        args: [
            {
                name: 'pin', required: true
            }, {
                name: 'callback', required: true
            }
        ],
        retval: {
        }
    },
    attachInterrupt: {
        args: [
            {
                name: 'pin',
            }, {
                name: 'handler',
            }, {
                name: 'mode',
            }, {
                name: 'callback'
            }
        ],
        retval: {
        }
    },
    detachInterrupt: {
        args: [
            {
                name: 'pin',
            }, {
                name: 'callback'
            }
        ],
        retval: {
        }
    },
    readTextFile: {
        args: [
            {
                name: 'filename', required: true
            }, {
                name: 'callback'
            }
        ],
        retval: {
        }
    },
    writeTextFile: {
        args: [
            {
                name: 'filename', required: true
            }, {
                name: 'data', required: true
            }, {
                name: 'callback'
            }
        ],
        retval: {
        }
    },
    getEeproms: {
        args: [
            { name: 'callback', required: true }
        ]
    },
    echo: {
        args: [
            {
                name: 'data',
            }, {
                name: 'callback'
            }
        ],
        retval: {
        }
    },
    setDate: {
        args: [
            {
                name: 'date',
            }, {
                name: 'callback'
            }
        ],
        retval: {
        }
    }
};

// These exported BoneScript functions:
// * Are an array of functions of type 'function(state, callback) {}'
// * Always return 'state', potentially with modifications
// * Always call 'callback' exactly once, if defined
// * Always confirms 'callback' is defined before calling it
// * Run synchronously if 'callback' is not defined
// * Will be called asynchronously always if called within a fiber
function bonescript_fn(fnName) {
    var fn = function() {
        var fiber = fibers.current;
        var yielded = false;
        var retval = true;
        var state = {};
        state.args = my.get_args(arguments, f, fnName);
        if(debug) winston.debug(fnName + '(' + JSON.stringify(state.args) + ')');
        if(state.args.callback) {
            my.run_async(f[fnName].fns, fnName, asyncCallback, state);
        } else if(fiber) {
            my.run_async(f[fnName].fns, fnName, fibersCallback, state);
            if(!fibersCallback.called) {
                yielded = true;
                fibers.yield();
            }
        } else {
            state = my.run_sync(f[fnName].fns, fnName, state);
            retval = my.get_retval(f, fnName, state);
        }

        function fibersCallback(state) {
            retval = my.get_retval(f, fnName, state);
            fibersCallback.called = true;
            if(yielded) fiber.run();
        }

        function doCallback(state) {
            my.do_callback(f, fnName, state);
        }

        return(retval);
    };
    return(fn);
}

f.getPinMode.fns = [
    hw.cleanupGetPinModeArgs,
    hw.findOCP,
    hw.findPWM,
    hw.readPWMFreq,
    hw.readPWMValue,
    hw.existsGPIODirection,
    hw.readGPIODirection,
    hw.readGPIOValue,
    hw.existsPinMux,
    hw.readPinMux
];

f.pinMode.fns = [
    hw.cleanupPinModeArgs,
    hw.existsLEDPinToGPIO,
    hw.setLEDPinToGPIO,
    f.getPinMode.fns,
    hw.findCapeMgr,
    hw.readSlots,
    hw.unloadSlotConflict,
    hw.readSlots,
    hw.existsDebugFS,
    hw.mountDebugFS,
    hw.existsDTBO,
    hw.existsDTS,
    hw.readDTSTemplate,
    hw.createDTS,
    hw.createDTBO,
    hw.loadHelperDTBO,
    hw.loadDTBO,
    hw.readSlots,
    hw.verifySlot,
    hw.existsGPIODirection,
    hw.enableGPIOControls,
    hw.setGPIODirection,
    hw.findPWM
];

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

f.digitalRead.f = function(pin, callback) {
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

f.analogRead.f = function(pin, callback) {
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

f.shiftOut.f = function(dataPin, clockPin, bitOrder, val, callback) {
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

f.attachInterrupt.f = function(pin, handler, mode, callback) {
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

    handler = (typeof handler === "string") ? my.myeval('(' + handler + ')') : handler;

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

f.detachInterrupt.f = function(pin, callback) {
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

// See http://processors.wiki.ti.com/index.php/AM335x_PWM_Driver's_Guide
// That guide isn't useful for the new pwm_test interface
f.analogWrite.f = function(pin, value, freq, callback) {
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

f.getEeproms.f = function(callback) {
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

f.readTextFile.fns = [
    function(state, callback) {
        if(callback) {
            fs.readFile(state.args.filename, 'ascii', onReadFile);

            function onReadFile(err, data) {
                if(err) state.err = 'Unable to read "' + state.args.filename + '": ' + err;
                state.data = data;
                callback(state);
            }
        } else {
            try {
                state.data = fs.readFile(state.args.filename, 'ascii', onReadFile);
            } catch(ex) {
                state.err = 'Unable to read "' + state.args.filename + '": ' + err;
            }
        }

        return(state);
    }
];

f.writeTextFile.f = function(filename, data, callback) {
    if(typeof callback == 'undefined') {
        return(my.wait_for(f.writeTextFile, arguments, 'err', true));
    }    
    fs.writeFile(filename, data, 'ascii', cb);
    
    function cb(err) {
        callback({'err':err});
    }
};

f.getPlatform.f = function(callback) {
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

f.echo.f = function(data, callback) {
    if(typeof callback == 'undefined') {
        return(my.wait_for(f.echo, arguments, 'data'));
    }    
    winston.info(data);
    callback({'data': data});
};

f.setDate.f = function(date, callback) {
    if(typeof callback == 'undefined') {
        return(my.wait_for(f.setDate, arguments, 'error', true));
    }    
    child_process.exec('date -s "' + date + '"', dateResponse);
    
    function dateResponse(error, stdout, stderr) {
        callback({'error': error, 'stdout':stdout, 'stderr':stderr});
    }
};

exports.delay = function(ms) {
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
    exports[x] = bonescript_fn(x);
    exports[x].args = f[x].args;
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

// Global variable assignments
// This section is broken out because it will eventually be deprecated
function setGlobals() {
    for(var x in exports) {
        global[x] = exports[x];
    }
    global.run = run;
}
exports.setGlobals = setGlobals;
