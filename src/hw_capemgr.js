var fs = require('fs');
var winston = require('winston');
var my = require('./my');
var parse = require('./parse');
var g = require('./constants');

var debug = true;

// Keep track of allocated resources
var gpioState = {};
var gpioIntState = {};
var pwmState = {};
var ainState = false;

// Keep track of file pointers
var gpioFile = {};
var pwmPrefix = {};
var ainPrefix = "";
var ocpFile = null;
var capemgrFile = null;

exports.logfile = '/var/lib/cloud9/bonescript.log';

exports.cleanupGetPinModeArgs = function(state, callback) {
};

// Inputs:
//   ocpFile
// Outputs:
//   ocpFile
//   state.err
exports.findOCP = function(state, callback) {
    if(!ocpFile) {
        if(callback) {
            my.file_find('/sys/devices', 'ocp.', 1, onFileFind);

            function onFileFind(ocp) {
                state.err = ocp.err;
                if(!state.err) ocpFile = ocp.path;
                callback(state);
            }
        } else {
            var ocp = my.file_find('/sys/devices', 'ocp.', 1);
            state.err = ocp.err;
            if(!state.err) ocpFile = ocp.path;
        }
    } else {
        if(callback) callback(state);
    }

    return(state);
};

// Inputs:
//   ocpFile
//   state.args.pin
//   pwmPrefix[state.args.pin.pwm.name]
// Outputs:
//   pwmPrefix[state.args.pin.pwm.name]
//   state.info
exports.findPWM = function(state, callback) {
    state = my.run_per_pin(findPWM_pin, state, callback);
    if(callback) callback(state);

    function findPWM_pin(pin, state, callback) {
        var key = pin.key;
        var pwm = pin.pwm;
        if(
            ocpFile                                         // path to ocp is provided
            && (typeof pwm != 'undefined')                  // pin has PWM capabilities
            && (typeof pwmState[pwm.name] == 'undefined')   // path isn't already known
        ) {
            if(callback) {
                my.file_find(ocpFile, 'bs_pwm_test_' + pin.key + '.', 1, onFindFile);

                function onFileFind(file) {
                    state.info = file.err;
                    if(!state.info) pwmPrefix[pwm.name] = file.path;
                    callback(state);
                }
            } else {
                var file = my.file_find(ocpFile, 'bs_pwm_test_' + pin.key + '.', 1);
                state.info = file.err;
                if(!state.info) pwmPrefix[pwm.name] = file.path;
            }
        } else {
            if(callback) callback(state);
        }

        return(state);
    }

    return(state);
};

// Inputs:
//   state.args.pin
//   pwmPrefix[state.args.pin.pwm.name]
//   state.mode[state.args.pin.key]
// Outputs:
//   state.mode[state.args.pin.key].{name,options,freq}
//   state.err
exports.readPWMFreq = function(state, callback) {
    state = my.run_per_pin(readPWMFreq_pin, state, callback);
    if(callback) callback(state);

    function readPWMFreq_pin(pin, state, callback) {
        var key = pin.key;
        var name = pin.name;
        var pwm = pin.pwm;
        if(typeof state.mode[key] == 'undefined') {
            state.mode[key] = {'name': name};
        }
        if(pin.options) state.mode[key].options = pin.options;

        // Get PWM frequency if applicable
        if(
            (typeof pwm != 'undefined')                     // pin has PWM capabilities
            && (typeof pwmPrefix[pwm.name] != 'undefined')  // PWM path is known
            && (typeof pwmState[pwm.name] != 'undefined')   // PWM used for this pin is enabled
            && (key == pwmState[pwm.name].key)              // PWM is allocated for this pin
        ) {
            if(callback) {
                fs.readFile(pwmPrefix[pwm.name]+'/period', onReadFile);

                function onReadFile(err, data) {
                    if(err) state.err = 'Unable to read PWM frequency: ' + err;
                    state.mode[key].freq = 1.0e9 / data;
                    callback(state);
                }
            } else {
                try {
                    var period = fs.readFileSync(pwmPrefix[pwm.name]+'/period');
                    state.mode[key].freq = 1.0e9 / period;
                } catch(ex) {
                    state.err = 'Unable to read PWM frequency: ' + ex;
                }
            }
        } else {
            if(callback) callback(state);
        }

        return(state);
    }

    return(state);
};

// Inputs:
//   state.args.pin
//   pwmPrefix[state.args.pin.pwm.name]
//   state.mode[state.args.pin.key].freq
// Outputs:
//   state.mode[state.args.pin.key].value
exports.readPWMValue = function(state, callback) {
    state = my.run_per_pin(readPWMValue_pin, state, callback);
    if(callback) callback(state);

    function readPWMValue_pin(pin, state, callback) {
        // Continue to getting PWM value, if applicable
        var key = pin.key;
        var pwm = pin.pwm;
        if(pwm && pwmPrefix[pwm.name] && state.mode[key].freq) {
            if(callback) {
                fs.readFile(pwmPrefix[pwm.name]+'/duty', onReadFile);

                function onReadFile(err, data) {
                    if(err) state.err = 'Unable to read PWM value: ' + err;
                    state.mode[key].value = duty * state.mode[key].freq / 1.0e9;
                    callback(state);
                }
            } else {
                try {
                    var duty = fs.readFileSync(pwmPrefix[pwm.name]+'/duty');
                    state.mode[key].value = duty * state.mode[key].freq / 1.0e9;
                } catch(ex) {
                    state.err = 'Unable to read PWM value: ' + ex;
                }
            }
        } else {
            if(callback) callback(state);
        }

        return(state);
    }

    return(state);
};

// Inputs:
//   state.args.pin
//   gpioState[state.args.pin.gpio]
//   state.mode[state.args.pin.key]
// Outputs:
//   state.mode[state.args.pin.key].{name,gpio}
//   state.mode[state.args.pin.key].gpio.{active,allocated,directionFile}
//   state.err
exports.existsGPIODirection = function(state, callback) {
    state = my.run_per_pin(existsGPIODirection_pin, state, callback);
    if(callback) callback(state);

    function existsGPIODirection_pin(pin, state, callback) {
        var key = pin.key;
        if(typeof state.mode[key] == 'undefined') {
            state.mode[key] = {'name': name};
        }

        // Get GPIO settings, if applicable
        if(typeof pin.gpio != 'undefined') {
            var n = pin.gpio;
            var directionFile = "/sys/class/gpio/gpio" + n + "/direction";
            state.mode[key].gpio = {};
            state.mode[key].gpio.active = false;
            state.mode[key].gpio.allocated = (typeof gpioState[n] != 'undefined');
            state.mode[key].gpio.directionFile = directionFile;
            if(callback) {
                my.file_exists(directionFile, onFileExists);

                function onFileExists(exists) {
                    if(exists) {
                        state.mode[key].gpio.active = true;
                    }
                    callback(state);
                }
            } else {
                if(my.file_existsSync(directionFile)) {
                    state.mode[key].gpio.active = true;
                }
            }
        } else {
            if(callback) callback(state);
        }

        return(state);
    }

    return(state);
};

// Inputs:
//   state.args.pin
//   gpioState[state.args.pin.gpio]
//   state.mode[state.args.pin.key].gpio.directionFile
// Outputs:
//   state.mode[state.args.pin.key].gpio.direction
//   state.err
exports.readGPIODirection = function(state, callback) {
    state = my.run_per_pin(readGPIODirection_pin, state, callback);
    if(callback) callback(state);

    // Continue to reading GPIO direction, if applicable
    function readGPIODirection_pin(pin, state, callback) {
        var key = pin.key;
        var directionFile = state.mode[key].directionFile;
        if(state.mode[key].gpio.active && directionFile) {
            if(callback) {
                fs.readFile(directionFile, 'utf-8', onReadFile);

                function onReadFile(err, data) {
                    state.mode[key].direction = data.replace(/^\s+|\s+$/g, '');
                    callback(state);
                }
            } else {
                var direction = fs.readFileSync(directionFile, 'utf-8');
                state.mode[key].direction = direction.replace(/^\s+|\s+$/g, '');
            }
        } else {
            if(callback) callback(state);
        }

        return(state);
    }

    return(state);
};

exports.existsPinMux = function(state, callback) {
    // Get pinmux settings
    state.mux = {available: false};
    state.pinctrlFile = '/sys/kernel/debug/pinctrl/44e10800.pinmux/pins';
    if(callback) {
        my.file_exists(state.pinctrlFile, onExists);

        function onExists(exists) {
            if(exists) {
                state.mux.available = true;
            }
            callback(state);
        }
    } else {
        state.mux.available = my.file_existsSync(state.pinctrlFile);
    }

    return(state);
};

exports.readPinMux = function(state, callback) {
    // Get pinmux settings continued, if available
    var muxRegOffset = parseInt(state.args.pin.muxRegOffset, 16);

    if(state.mux.available) {
        if(callback) {
            fs.readFile(state.pinctrlFile, 'utf8', readPinctrl);
            function onReadFile(err, data) {
                if(err) {
                    state.err = 'Unable to read pinctl file: ' + err;
                }
                state.mode = parse.modeFromPinctrl(data, muxRegOffset, 0x44e10800, state.mode);
                callback(state);
            }
        } else {
            var data = fs.readFileSync(state.pinctrlFile, 'utf8');
            state.mode = parse.modeFromPinctrl(data, muxRegOffset, 0x44e10800, state.mode);
        }
    } else {
        if(callback) callback(state);
    }

    return(state);
};

// Function: cleanupPinModeArgs
// Inputs:
//   state.args.pin
//   state.args.direction
//   state.args.pullup
//   state.args.mux
// Outputs:
//   state.args.{pin,direction,pullup,mux}
//   state.mode[key].{value,pinData}
//   state.mode[key].{template,templateFilename,slotRegex}
//   state.mode[key].{helperDTBO,fragment,dtsFilename,dtboFilename}
//   pwmState
exports.cleanupPinModeArgs = function(state, callback) {
    state.value = true;
    state.template = 'bspm';

    // if direction is INPUT_PULLUP, then pullup is PULLUP
    if(state.args.direction == g.INPUT_PULLUP) state.args.pullup = 'pullup';

    // pullup default for input is PULLDOWN, and for output is DISABLED
    if(typeof state.args.pullup == 'undefined') {
        state.args.pullup = (state.args.direction == g.INPUT) ? 'pulldown' : 'disabled';
    }

    // See if we are trying to configure for PWM mode
    if(
        state.args.direction == g.ANALOG_OUTPUT
        || state.args.mux == g.ANALOG_OUTPUT
        || (typeof state.args.pin.pwm != 'undefined' && state.args.mux == state.args.pin.pwm.muxmode)
    ) {
        // Send and error if the pin doesn't support PWM
        if(
            (typeof state.args.pin.pwm == 'undefined') ||          // pin does not have PWM capability
            (typeof state.args.pin.pwm.muxmode == 'undefined')     // required muxmode is not provided
        ) {
            state.err = 'pinMode only supports ANALOG_OUTPUT for PWM pins: ' + state.args.pin.key;
            state.value = false;
        } else {
            state.args.direction = g.OUTPUT;
            state.args.mux = state.args.pin.pwm.muxmode;
            state.template = 'bspwm';
            pwmState[state.args.pin.pwm.name] = {'key': state.args.pin.key, 'freq': 0};
        }
    }

    // Figure out the desired value
    state.pinData = my.pin_data(state.args.slew, state.args.direction, state.args.pullup, state.args.mux);
    state.fragment = state.template + '_' + state.args.pin.key + '_' + state.pinData.toString(16);
    state.dtsFilename = '/lib/firmware/' + state.fragment + '-00A0.dts';
    state.dtboFilename = '/lib/firmware/' + state.fragment + '-00A0.dtbo';
    state.templateFilename =
        require.resolve('bonescript').replace('index.js', 'dts/' + template + '_template.dts');
    if(state.template == 'bspwm') {
        state.helperDTBO = 'am33xx_pwm';
    }

    if(state.args.pin) {
        state.slotRegex = new RegExp('\\d+(?=\\s*:.*,bs.*' + state.args.pin.key + ')', 'gm');
    }

    if(callback) callback(state);
    return(state);
};

exports.existsLEDPinToGPIO = function(state, callback) {
    // Handle case where pin is allocated as a gpio-led
    if(state.args.pin.led) {
        var path = "/sys/class/leds/beaglebone:green:" + state.args.pin.led + "/trigger";
        if((state.args.direction != g.OUTPUT) || (state.args.mux != 7)) {
            state.err = 'pinMode only supports GPIO output for LEDs: ' + JSON.strigify(state.args);
            if(callback) callback(state);
        } else {
            if(callback) {
                my.file_exists(path, onExists);

                function onExists(exists) {
                    if(!exists) state.err = 'Could not find ' + path + ': ' + err;
                    callback(state);
                }
            } else {
                var exists = my.file_existsSync(path);
                if(!exists) state.err = 'Could not find ' + path + ': ' + err;
            }
        }
    } else {
        if(callback) callback(state);
    }

    return(state);
};

// Inputs:
//   gpioState
//   state.args.pin.led
// Outputs:
//   gpioState
//   state.done
exports.setLEDPinToGPIO = function(state, callback) {
    // Handle case where pin is allocated as a gpio-led
    if(state.args.pin.led && !gpioState[state.args.pin.gpio]) {
        var path = "/sys/class/leds/beaglebone:green:" + state.args.pin.led + "/trigger";
        if(callback) {
            fs.writeFile(path, "gpio", onWriteFile);

            function onWriteFile(err) {
                if(err) {
                    state.err = 'Error writing "gpio" to ' + path + ': ' + err;
                } else {
                    gpioState[state.args.pin.gpio] = true;
                    state.done = true;
                }
                callback(state);
            }
        } else {
            try {
                fs.writeFileSync(path, "gpio");
                gpioState[state.arg.pin.gpio] = true;
                state.done = true;
            } catch(ex) {
                state.err = 'Error writing "gpio" to ' + path + ': ' + ex;
            }
        }
    } else {
        if(state.args.pin.led && gpioState[state.args.pin.gpio]) {
            state.done = true;
        }
        if(callback) callback(state);
    }

    return(state);
};

// Inputs:
//   capemgrFile
// Outputs:
//   capemgrFile
exports.findCapeMgr = function(state, callback) {
    if(!capemgrFile) {
        if(callback) {
            my.file_find('/sys/devices', 'bone_capemgr.', 1, onFileFind);

            function onFileFind(capemgr) {
                state.err = capemgr.err;
                if(!state.err) capemgrFile = capemgr.path;
                callback(state);
            }
        } else {
            var capemgr = my.file_find('/sys/devices', 'bone_capemgr.', 1);
            state.err = capemgr.err;
            if(!state.err) capemgrFile = capemgr.path;
        }
    } else {
        if(callback) callback(state);
    }

    return(state);
};

exports.readSlots = function(state, callback) {
    if(capemgrFile && !state.slots) {
        var slotsFile = capemgrFile + '/slots';
        if(callback) {
            fs.readFile(slotsFile, 'ascii', onReadFile);

            function onReadFile(err, data) {
                if(err) state.err = "Unable to read " + slotsFile + ": " + err;
                state.slots = data;
                if(state.slotRegex) {
                    state.slotMatch = data.match(state.slotRegex);
                }
                callback(state);
            }
        } else {
            try {
                state.slots = fs.readFileSync(capemgrFile + '/slots', 'ascii');
                if(state.slotRegex) {
                    state.slotMatch = state.slots.match(state.slotRegex);
                }
            } catch(ex) {
                state.err = "Unable to read " + slotsFile + ": " + ex;
            }
        }
    } else {
        state.err = "CapeMgr not found";
        if(callback) callback(state);
    }

    return(state);
};

exports.unloadSlotConflict = function(state, callback) {
    if(state.slotMatch && state.slotMatch[0] && (state.slots.indexOf(state.fragment) < 0)) {
        var slotsFile = capemgrFile + '/slots';
        var unloadText = '-'+state.slotMatch[0];
        if(callback) {
            fs.writeFile(slotsFile, unloadText, 'ascii', onWriteFile);

            function onWriteFile(err) {
                state.slots = null;
                state.slotMatch = null;
                if(err) state.err = 'Error writing "' + unloadText + '" to "' + slotsFile + '": ' + err;
                callback(state);
            }
        } else {
            try {
                state.slots = null;
                state.slotMatch = null;
                fs.writeFileSync(slotsFile, unloadText, 'ascii');
            } catch(ex) {
                state.err = 'Error writing "' + unloadText + '" to "' + slotsFile + '": ' + ex;
            }
        }
    } else {
        if(callback) callback(state);
    }
    return(state);
};

exports.existsDebugFS = function(state, callback) {
    // TODO: Determine if /sys/kernel/debug is mounted
    if(callback) callback(state);
    return(state);
};

exports.mountDebugFS = function(state, callback) {
    // TODO: Perform 'mount -t debugfs none /sys/kernel/debug'
    if(callback) callback(state);
    return(state);
};

exports.existsDTBO = function(state, callback) {
    if(state.dtboFilename) {
        if(callback) {
            my.file_exists(state.dtboFilename, onExists);

            function onExists(exists) {
                state.dtboExists = exists;
                callback(state);
            }
        } else {
            state.dtboExists = my.file_existsSync(state.dtboFilename);
        }
    } else {
        if(callback) callback(state);
    }

    return(state);
};

exports.existsDTS = function(state, callback) {
    if(state.dtsFilename) {
        if(callback) {
            my.file_exists(state.dtsFilename, onExists);

            function onExists(exists) {
                state.dtsExists = exists;
                callback(state);
            }
        } else {
            state.dtsExists = my.file_existsSync(state.dtsFilename);
        }
    } else {
        if(callback) callback(state);
    }

    return(state);
};

exports.readDTSTemplate = function(state, callback) {
    if(state.templateFilename) {
        if(callback) {
            fs.readFile(state.templateFilename, 'utf8', onFileRead);

            function onFileRead(err, data) {
                if(err) state.err = 'Error reading "' + state.templateFilename + '": ' + err;
                state.templateData = data;
                callback(state);
            }
        } else {
            try {
                state.templateData = fs.readFileSync(state.templateFilename, 'utf8');
            } catch(ex) {
                state.err = 'Error reading "' + state.templateFilename + '": ' + ex;
            }
        }
    } else {
        if(callback) callback(state);
    }

    return(state);
};

exports.createDTS = function(state, callback) {
    if(state.templateData && (!state.dtsExists || state.forceDTSCreate)) {
        var dts = state.templateData;
        dts = dts.replace(/!PIN_KEY!/g, pin.key);
        dts = dts.replace(/!PIN_DOT_KEY!/g, pin.key.replace(/_/, '.'));
        dts = dts.replace(/!PIN_FUNCTION!/g, pin.options[data&7]);
        dts = dts.replace(/!PIN_OFFSET!/g, pin.muxRegOffset);
        dts = dts.replace(/!DATA!/g, '0x' + data.toString(16));
        if(state.args.pin.pwm) {
            dts = dts.replace(/!PWM_MODULE!/g, pin.pwm.module);
            dts = dts.replace(/!PWM_INDEX!/g, pin.pwm.index);
            dts = dts.replace(/!DUTY_CYCLE!/g, 500000);
        }
        if(callback) {
            fs.writeFile(state.dtsFilename, dts, 'ascii', onWriteFile);

            function onWriteFile(err) {
                if(err) state.err = 'Error writing to "' + state.dtsFilename + '": ' + err;
            }
        } else {
            try {
                fs.writeFileSync(state.dtsFilename, dts, 'ascii');
            } catch(ex) {
                state.err = 'Error writing to "' + state.dtsFilename + '": ' + err;
            }
        }
    } else {
        if(callback) callback(state);
    }

    return(state);
};

exports.createDTBO = function(state, callback) {
    if(state.templateData && (!state.dtsExists || state.forceDTSCreate)) {
        var command = 'dtc -O dtb -o ' + state.dtboFilename + ' -b 0 -@ ' + statedtsFilename;
        if(callback) {
            var dtcExec = child_process.exec(command, onExec);
            dtcExec.on('close', onExecClose);

            function onExec(error, stdout, stderr) {
            }

            function onExecClose(code, signal) {
                if(code) state.err = "'dtc' returned: " + code;
                if(signal) state.err = "'dtc' exited due to signal: " + signal;
                callback(state);
            }
        } else {
            var code = my.execSync(command);
            if(code) state.err = "'dtc' returned: " + code;
        }
    } else {
        if(callback) callback(state);
    }

    return(state);
};

exports.loadHelperDTBO = function(state, callback) {
    if(state.helperDTBO && (state.slots.indexOf(state.helperDTBO) < 0) && capemgrFile) {
        var slotsFile = capemgrFile + '/slots';
        if(callback) {
            fs.writeFile(slotsFile, state.helperDTBO, 'ascii', onWriteFile);

            function onWriteFile(err) {
                if(err) state.err = 'Error loading "' + state.helperDTBO + '": ' + err;
                callback(state);
            }
        } else {
            try {
                fs.writeFileSync(slotsFile, state.helperDTBO, 'ascii');
            } catch(ex) {
                state.err = 'Error loading "' + state.helperDTBO + '": ' + ex;
            }
        }
    }
    return(state);
};

exports.loadDTBO = function(state, callback) {
    if(state.fragment &&  (state.slots.indexOf(state.fragment) < 0) && capemgrFile) {
        var slotsFile = capemgrFile + '/slots';
        if(callback) {
            fs.writeFile(slotsFile, state.fragment, 'ascii', onWriteFile);

            function onWriteFile(err) {
                if(err) state.err = 'Error loading "' + state.fragment + '": ' + err;
                callback(state);
            }
        } else {
            try {
                fs.writeFileSync(slotsFile, state.fragment, 'ascii');
            } catch(ex) {
                state.err = 'Error loading "' + state.fragment + '": ' + ex;
            }
        }
    }
    return(state);
};

exports.verifySlot = function(state, callback) {
    if(state.fragment) {
        if(state.slots.indexOf(state.fragment) < 0) {
            state.err = 'CapeMgr says that "' + state.fragment + '" is not loaded:\n' + state.slots;
        }
    }

    if(callback) callback(state);
    return(state);
};

exports.existsGPIODirection = function(state, callback) {
    if(state.args.mux == 7 && state.args.pin.gpio) {
        var n = state.args.pin.gpio;
        var directionFile = '/sys/class/gpio/gpio' + n + '/direction',
        var valueFile = '/sys/class/gpio/gpio' + n + '/value',
        var exists = false;
        if(callback) my.file_exists(directionFile, onFileExists);
        else {
            exists = my.file_exists(directionFile);
            gpioFile
        }

        function onFileExists(exists) {
            callback(state);
        }
    } else {
        if(callback) callback(state);
    }

    return(state);
};

exports.enableGPIOControls = function(state, callback) {
    if(state.args.mux == 7 && state.args.pin.gpio && !state.) {
    } else {
        if(callback) callback(state);
    }

    return(state);
};

exports.setGPIODirection = function(state, callback) {
    if(true) {
    } else {
        if(callback) callback(state);
    }

    return(state);
};

exports.setPinMode = function(pin, pinData, template, resp, callback) {
    if(template == 'bspm') {
        gpioFile[pin.key] = '/sys/class/gpio/gpio' + pin.gpio + '/value';
        doCreateDT(resp);
    } else if(template == 'bspwm') {
        my.load_dt('am33xx_pwm', null, resp, doCreateDT);
    } else {
        resp.err = 'Unknown pin mode template';
        callback(resp);
    }
    
    function doCreateDT(resp) {
        if(resp.err) {
            callback(resp);
            return;
        }
        my.create_dt(pin, pinData, template, true, false, resp, onCreateDT);
    }
    
    function onCreateDT(resp) {
        if(resp.err) {
            callback(resp);
            return;
        }
        if(template == 'bspwm') {
            my.file_find('/sys/devices', 'ocp.', 1, onFindOCP);
        } else {
            callback(resp);
        }
        
        function onFindOCP(ocp) {
            if(ocp.err) {
                resp.err = "Error searching for ocp: " + ocp.err;
                if(debug) winston.debug(resp.err);
                callback(resp);
                return;
            }
            my.file_find(ocp.path, 'bs_pwm_test_' + pin.key + '.', 1, onFindPWM);
        }
        
        function onFindPWM(pwm_test) {
            if(pwm_test.err) {
                resp.err = "Error searching for pwm_test: " + pwm_test.err;
                if(debug) winston.debug(resp.err);
                callback(resp);
                return;
            }
            my.file_find(pwm_test.path, 'period', 1, onFindPeriod);
            
            function onFindPeriod(period) {
                if(period.err) {
                    resp.err = "Error searching for period: " + period.err;
                    if(debug) winston.debug(resp.err);
                    callback(resp);
                    return;
                }  
                pwmPrefix[pin.pwm.name] = pwm_test.path;
                fs.writeFile(pwm_test.path+'/polarity', 0, 'ascii', onPolarityWrite);
            }        
        }
        
        function onPolarityWrite(err) {
            if(err) {
                resp.err = "Error writing PWM polarity: " + err;
                if(debug) winston.debug(resp.err);
            }
            callback(resp);
        }
    }
};

exports.exportGPIOControls = function(pin, direction, resp, callback) {
    if(debug) winston.debug('hw.exportGPIOControls(' + [pin.key, direction, resp] + ');');
    var n = pin.gpio;
    my.file_exists(gpioFile[pin.key], onFileExists);
    
    function onFileExists(exists) {
        if(exists) {
            if(debug) winston.debug("gpio: " + n + " already exported.");
            fs.writeFile("/sys/class/gpio/gpio" + n + "/direction",
                direction, null, onGPIODirectionSet);
        } else {
            if(debug) winston.debug("exporting gpio: " + n);
            fs.writeFile("/sys/class/gpio/export", "" + n, null, onGPIOExport);
        }
    }
 
    function onGPIOExport(err) {
        if(err) onError(err);
        if(debug) winston.debug("setting gpio " + n +
            " direction to " + direction);
        fs.writeFile("/sys/class/gpio/gpio" + n + "/direction",
            direction, null, onGPIODirectionSet);
    }

    function onGPIODirectionSet(err) {
        if(err) onError(err);
        else callback(resp);
    }
    
    function onError(err) {
        resp.err = 'Unable to export gpio-' + n + ': ' + err;
        resp.value = false;
        if(debug) winston.debug(resp.err);
        findOwner();
    }
    
    function findOwner() {
        fs.readFile('/sys/kernel/debug/gpio', 'utf-8', onGPIOUsers);
    }
    
    function onGPIOUsers(err, data) {
        if(!err) {
            var gpioUsers = data.split('\n');
            for(var x in gpioUsers) {
                var y = gpioUsers[x].match(/gpio-(\d+)\s+\((\S+)\s*\)/);
                if(y && y[1] == n) {
                    resp.err += '\nconsumed by ' + y[2];
                    if(debug) winston.debug(resp.err);
                }
            }
        }
        callback(resp);
    }
    
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
    fs.writeFile(gpioFile[pin.key], '' + value, null, callback);
};

exports.readGPIOValue = function(pin, resp, callback) {
    var gpioFile = '/sys/class/gpio/gpio' + pin.gpio + '/value';
    var readFile = function(err, data) {
        if(err) {
            resp.err = 'digitalRead error: ' + err;
            winston.error(resp.err);
        }
        resp.value = parseInt(data, 2);
        callback(resp);
    };
    fs.readFile(gpioFile, readFile);
};

exports.enableAIN = function(callback) {
    var resp = {};
    var ocp = my.is_ocp();
    if(!ocp) {
        resp.err = 'enableAIN: Unable to open ocp file';
        if(debug) winston.debug(resp.err);
        callback(resp);
        return;
    }
    
    my.load_dt('cape-bone-iio', null, {}, onLoadDT);
    
    function onLoadDT(x) {
        if(x.err) {
            callback(x);
            return;
        }
        my.find_sysfsFile('helper', ocp, 'helper.', onHelper);
    }

    function onHelper(x) {
        if(x.err || !x.path) {
            resp.err = 'Error enabling analog inputs: ' + x.err;
            if(debug) winston.debug(resp.err);
        } else {
            ainPrefix = x.path + '/AIN';
            if(debug) winston.debug("Setting ainPrefix to " + ainPrefix);
        }
        callback(x);
    }
};

exports.readAIN = function(pin, resp, callback) {
    var ainFile = ainPrefix + pin.ain.toString();
    fs.readFile(ainFile, readFile);
    
    function readFile(err, data) {
        if(err) {
            resp.err = 'analogRead error: ' + err;
            winston.error(resp.err);
        }
        resp.value = parseInt(data, 10) / 1800;
        callback(resp);
    }
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
        var duty = Math.round( period * value );
        fs.writeFileSync(path+'/duty', 0);
        if(pwm.freq != freq) {
            fs.writeFileSync(path+'/period', period);
        }
        fs.writeFileSync(path+'/duty', duty);
    } catch(ex) {
        resp.err = 'error updating PWM freq and value: ' + path + ', ' + ex;
        winston.error(resp.err);
    }
    return(resp);
};

exports.readEeproms = function(eeproms) {
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
    return(eeproms);
};

exports.readPlatform = function(platform) {
    platform.name = fs.readFileSync(my.is_capemgr() + '/baseboard/board-name',
        'ascii').trim();
    if(platform.name == 'A335BONE') platform.name = 'BeagleBone';
    if(platform.name == 'A335BNLT') platform.name = 'BeagleBone Black';
    platform.version = fs.readFileSync(my.is_capemgr() + '/baseboard/revision',
        'ascii').trim();
    if(!platform.version.match(/^[\040-\176]*$/)) delete platform.version;
    platform.serialNumber = fs.readFileSync(my.is_capemgr() +
        '/baseboard/serial-number', 'ascii').trim();
    if(!platform.serialNumber.match(/^[\040-\176]*$/)) delete platform.serialNumber;
    return(platform);
};
