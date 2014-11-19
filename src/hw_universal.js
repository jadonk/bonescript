// Copyright Aditya Patadia, Octal Consulting LLP
var fs = require('fs');
var winston = require('winston');
var bone = require('./bone');
var parse = require('./parse');
var eeprom = require('./eeprom');

var gpioFile = {};
var pwmPrefix = {};
var ainPrefix = "";
var watchdogFile = null;
var watchdogTimer = null;

module.exports = {

    startWatchdog : function() {
        if(watchdogFile !== null) {
            winston.error("Watchdog timer is already running");
            return false;
        }
        fs.open("/dev/watchdog","w+",function(err, fd){
            watchdogFile = fd;
            watchdogTimer = setInterval(function(){
                fs.write(watchdogFile,"\n");
            },5000);
        });
    },

    stopWatchdog : function() {
        if(watchdogFile === null) {
            winston.error("Watchdog timer is not running");
            return false;
        }
        clearInterval(watchdogTimer);
        fs.close(watchdogFile);
    },

    readPWMFreqAndValue : function(pin, pwm, callback) {
        var mode = {};
        var period  = null;
        fs.readFile(pwmPrefix[pin.pwm.name]+'/period_ns', "utf8", onReadPeriod);

        function onReadPeriod(err,data){
            period = data;
            fs.readFile(pwmPrefix[pin.pwm.name]+'/duty_ns', "utf8", onReadDuty);
        }

        function onReadDuty(err, duty){
            mode.freq = 1.0e9 / period;
            mode.value = duty / period;
            callback(mode);
        }
    },

    readGPIODirection : function(n, gpio, callback) {
        var mode = {};
        var directionFile = "/sys/class/gpio/gpio" + n + "/direction";
        fs.exists(directionFile,function(exists){
            if(exists){
                fs.readFile(directionFile, 'utf8', onReadDirection);
            } else {
                callback(mode);
            }
        });

        function onReadDirection(err, direction){
            mode.active = true;
            mode.direction = direction.trim();
            callback(mode);
        }
    },

    readPinState : function(pin, callback){
        var p = pin.key + "_pinmux";
        var pinmux = bone.find_sysfsFile(p, bone.is_ocp(), p + '.');
        fs.readFile(pinmux+"/state", 'utf8', function(err, state){
            callback(state.trim());
        });
    },

    readPinMux : function(pin, mode, callback) {
        var pinctrlFile = '/sys/kernel/debug/pinctrl/44e10800.pinmux/pins';
        var muxRegOffset = parseInt(pin.muxRegOffset, 16);
        var readPinctrl = function(err, data) {
            if(err) {
                mode.err = 'readPinctrl error: ' + err;
                winston.debug(mode.err);
                callback(mode);
            }
            mode = parse.modeFromPinctrl(data, muxRegOffset, 0x44e10800, mode);
            callback(mode);
        };
        var tryPinctrl = function(exists) {
            if(exists) {
                fs.readFile(pinctrlFile, 'utf8', readPinctrl);
            } else {
                winston.debug('getPinMode(' + pin.key + '): no valid mux data');
                callback(mode);
            }
        };
        if(callback) {
            fs.exists(pinctrlFile, tryPinctrl);
        } else {
            try {
                var data2 = fs.readFileSync(pinctrlFile, 'utf8');
                mode = parse.modeFromPinctrl(data2, muxRegOffset, 0x44e10800, mode);
            } catch(ex) {
                winston.debug('getPinMode(' + pin.key + '): ' + ex);
            }
        }
        return(mode);
    },

    setPinMode : function(pin, mode, resp, callback) {
        winston.debug('hw.setPinMode(' + [pin.key, mode, JSON.stringify(resp)] + ');');
        var p = pin.key + "_pinmux";
        var pinmux = bone.find_sysfsFile(p, bone.is_ocp(), p + '.');
        if(mode == "gpio" || mode == "gpio_pu" || mode == "gpio_pd") {
            gpioFile[pin.key] = '/sys/class/gpio/gpio' + pin.gpio + '/value';
            fs.writeFile(pinmux+"/state", mode, onModeComplete);
        } else if(mode == "pwm") {
            fs.writeFile(pinmux+"/state", mode, onWriteState); //write mode to the state file...
        } else {
            resp.err = 'This mode is currently not supported by octalbonescript';
            callback(resp);
        }

        function onWriteState(err){
            if(err){
                resp.err = err;
                winston.error("onWriteState problem: " + err);
                if(typeof callback == 'function') callback(resp);
                return;
            }
            pwmPrefix[pin.pwm.name] = '/sys/class/pwm/pwm' + pin.pwm.sysfs;
            fs.exists(pwmPrefix[pin.pwm.name],function(exists) {
                if(!exists){
                    fs.appendFile('/sys/class/pwm/export', pin.pwm.sysfs, onExport); // now export if not exported
                } else {
                    fs.appendFile(pwmPrefix[pin.pwm.name]+'/run', 1, onModeComplete); // now start PWM
                }
            });
        }

        function onExport(err){
            if(err){
                resp.err = err;
                winston.error("onExport problem: " + err);
                if(typeof callback == 'function') callback(resp);
                return;
            }
            fs.appendFile(pwmPrefix[pin.pwm.name]+'/run', 1, onModeComplete); // now start PWM
        }

        function onModeComplete(err){
            if(err){
                resp.err = err;
                winston.error("onComplete problem: " + err);
                if(typeof callback == 'function') callback(resp);
                return;
            }
            if(typeof callback == 'function') callback(resp);
        }
    },

    setLEDPinToGPIO : function(pin, resp, callback) {
        var path = "/sys/class/leds/beaglebone:green:" + pin.led + "/trigger";
        fs.exists(path, function(exists){
            if(exists) {
                fs.writeFile(path, "gpio", onWriteMode);
            } else {
                resp.err = "Unable to find LED " + pin.led;
                winston.error(resp.err);
                resp.value = false;
                callback(resp);
            }
        });

        function onWriteMode(err){
            callback(resp);
        }
    },

    exportGPIOControls : function(pin, direction, resp, callback) {
        winston.debug('hw.exportGPIOControls(' + [pin.key, direction, resp] + ');');
        var n = pin.gpio;
        fs.exists(gpioFile[pin.key], onFileExists);
        
        function onFileExists(exists) {
            if(exists) {
                winston.debug("gpio: " + n + " already exported.");
                fs.writeFile("/sys/class/gpio/gpio" + n + "/direction",
                    direction, null, onGPIODirectionSet);
            } else {
                winston.debug("exporting gpio: " + n);
                fs.writeFile("/sys/class/gpio/export", "" + n, null, onGPIOExport);
            }
        }
     
        function onGPIOExport(err) {
            if(err) onError(err);
            winston.debug("setting gpio " + n +
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
            winston.debug(resp.err);
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
                        winston.debug(resp.err);
                    }
                }
            }
            callback(resp);
        }
        
        return(resp);
    },

    writeGPIOValue : function(pin, value, callback) {
        if(typeof gpioFile[pin.key] == 'undefined') {
            gpioFile[pin.key] = '/sys/class/gpio/gpio' + pin.gpio + '/value';
            if(pin.led) {
                gpioFile[pin.key] = "/sys/class/leds/beaglebone:";
                gpioFile[pin.key] += "green:" + pin.led + "/brightness";
            }
            fs.exists(gpioFile[pin.key],function(exists) {
                if(!exists) winston.error("Unable to find gpio: " + gpioFile[pin.key]);
            });
        }
        winston.debug("gpioFile = " + gpioFile[pin.key]);
        fs.writeFile(gpioFile[pin.key], '' + value, null, onWriteGPIO);
        function onWriteGPIO(err){
            if(err) winston.error("Writing to GPIO failed: "+err);
            if(typeof callback == 'function') callback(err);
        }
    },

    writeGPIOValueSync : function(pin, value, callback) {
        if(typeof gpioFile[pin.key] == 'undefined') {
            gpioFile[pin.key] = '/sys/class/gpio/gpio' + pin.gpio + '/value';
            if(pin.led) {
                gpioFile[pin.key] = "/sys/class/leds/beaglebone:";
                gpioFile[pin.key] += "green:" + pin.led + "/brightness";
            }
            if(!fs.existsSync(gpioFile[pin.key])) {
                winston.error("Unable to find gpio: " + gpioFile[pin.key]);
            }
        }
        winston.debug("gpioFile = " + gpioFile[pin.key]);
        try {
            fs.writeFileSync(gpioFile[pin.key], '' + value, null);
            if(typeof callback == 'function') callback();
        } catch(err){
            if(err) winston.error("Writing to GPIO failed: "+err);
        }
    },

    readGPIOValue : function(pin, resp, callback) {
        var gpioFile = '/sys/class/gpio/gpio' + pin.gpio + '/value';
        fs.readFile(gpioFile, onGPIORead);

        function onGPIORead(err, data) {
            if(err) {
                resp.err = 'digitalRead error: ' + err;
                winston.error(resp.err);
            }
            resp.value = parseInt(data, 2);
            callback(resp);
        }
    },

    enableAIN : function(callback) {
        var helper = "";
        var resp = bone.load_dt_sync('cape-bone-iio');

        onLoadCape(resp);
        
        function onLoadCape(resp){
            if(typeof resp.err != 'undefined') {
                winston.error('enableAIN: load of cape-bone-iio failed');
                if(typeof callback == 'function') callback(resp);
            } else {
                var ocp = bone.is_ocp();
                if(ocp) {
                    helper = bone.find_sysfsFile('helper', ocp, 'helper.');
                    if(helper) {
                        ainPrefix = helper + '/AIN';
                    }
                }
                if(typeof callback == 'function') callback({'path': helper});
            }

        }
    },

    readAIN : function(pin, resp, callback) {
        var ainFile = ainPrefix + pin.ain.toString();
        fs.readFile(ainFile, onReadAIN);
        
        function onReadAIN(err, data) {
            if(err) {
                resp.err = 'analogRead error: ' + err;
                winston.error(resp.err);
            } else {
                resp.value = parseInt(data, 10) / 1800;
            }
            callback(resp);
        }
    },

    writeGPIOEdge : function(pin, mode) {
        fs.writeFileSync('/sys/class/gpio/gpio' + pin.gpio + '/edge', mode);

        var resp = {};
        resp.gpioFile = '/sys/class/gpio/gpio' + pin.gpio + '/value';
        resp.valuefd = fs.openSync(resp.gpioFile, 'r');
        resp.value = new Buffer(1);

        return(resp);
    },

    stopPWM : function(pin, pwm, callback){
        var resp = {};
        var path = pwmPrefix[pin.pwm.name];
        winston.debug('Stopping PWM');
        fs.writeFile(path+'/run', "0\n", onStopPWM);
        function onStopPWM(err){
            if(err) {
                resp.err = "Fail to stop PWM: " + err;
                winston.error(resp.err);
            }
            if(typeof callback == 'function') callback(resp);
        }
    },

    startPWM : function(pin, pwm, callback){
        var resp = {};
        var path = pwmPrefix[pin.pwm.name];
        winston.debug('Starting PWM');
        fs.writeFile(path+'/run', "1\n", onStartPWM);
        function onStartPWM(err){
            if(err) {
                resp.err = "Fail to stop PWM: " + err;
                winston.error(resp.err);
            }
            if(typeof callback == 'function') callback(resp);
        }
    },

    writePWMFreqAndValue : function(pin, pwm, freq, value, resp, callback) {
        winston.debug('hw.writePWMFreqAndValue(' + [pin.key,pwm,freq,value,resp] + ');');
        var path = pwmPrefix[pin.pwm.name];
        var period = Math.round( 1.0e9 / freq ); // period in ns
        var duty = Math.round( period * value );

        var currentDuty;

        fs.readFile(path+'/duty_ns',onReadDuty);

        function onReadDuty(err, readDuty){
            currentDuty = readDuty;
            if(period >= currentDuty) {
                fs.writeFile(path+'/period_ns', period, onWritePeriod);
            } else {
                 fs.writeFile(path+'/duty_ns', duty, onWriteDuty);
            }
        }

        function onWritePeriod(err){
            if(err) {
                resp.err = "Fail to update PWM period: " + err;
                winston.error(resp.err);
                if(typeof callback == 'function') callback(resp);
                return;
            }
            if(period >= currentDuty) {
                fs.writeFile(path+'/duty_ns', duty, onWriteDuty)
            } else {
                module.exports.startPWM(pin, pwm, callback);
            }

        }

        function onWriteDuty(err){
            if(err) {
                resp.err = "Fail to update PWM duty: " + err;
                winston.error(resp.err);
                if(typeof callback == 'function') callback(resp);
                return;
            }
            if(period >= currentDuty) {
                module.exports.startPWM(pin, pwm, callback);
            } else {
                fs.writeFile(path+'/period_ns', period, onWritePeriod);
            }
        }
    },

    readEeproms : function(eeproms) {
        var EepromFiles = {
            '/sys/bus/i2c/drivers/at24/0-0050/eeprom': { type: 'bone' },
            '/sys/bus/i2c/drivers/at24/2-0054/eeprom': { type: 'cape' },
            '/sys/bus/i2c/drivers/at24/2-0055/eeprom': { type: 'cape' },
            '/sys/bus/i2c/drivers/at24/2-0056/eeprom': { type: 'cape' },
            '/sys/bus/i2c/drivers/at24/2-0057/eeprom': { type: 'cape' }
        };
        eeproms = eeprom.readEeproms(EepromFiles);
        return(eeproms);
    },

    readPlatform : function(platform) {
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
    }
};
