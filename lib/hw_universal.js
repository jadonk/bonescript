// Copyright Aditya Patadia, Octal Consulting LLP
var fs = require('fs');
var debug = require('debug')('bone');
var bone = require('./bone');
var verror = require("verror");
var eeprom = require('./eeprom');

var gpioFile = {};
var pwmPrefix = {};
var ainPrefix = "";
var watchdogFile = null;
var watchdogTimer = null;

module.exports = {

    startWatchdog : function() {
        if(watchdogFile !== null) {
            console.warn("Watchdog timer is already running");
            return false;
        }
        fs.open("/dev/watchdog","w+",function(err, fd){
            watchdogFile = fd;
            watchdogTimer = setInterval(function(){
                fs.write(watchdogFile,"\n");
            },10000);
        });
    },

    stopWatchdog : function() {
        if(watchdogFile === null) {
            console.warn("Watchdog timer is not running");
            return false;
        }
        clearInterval(watchdogTimer);
        fs.close(watchdogFile);
    },

    readPWMFreqAndValue : function(pin, pwm, callback) {
        debug("readPWMFreqAndValue(" + pin.key + ")");
        var resp = {};
        var error;
        var period  = null;
        fs.readFile(pwmPrefix[pin.pwm.name]+'/period_ns', "utf8", onReadPeriod);

        function onReadPeriod(err,data){
            if(err){
                error = new verror(err + ': Unable to read period from ' + pwmPrefix[pin.pwm.name]+'/period_ns' );
            }
            period = data;
            fs.readFile(pwmPrefix[pin.pwm.name]+'/duty_ns', "utf8", onReadDuty);
        }

        function onReadDuty(err, duty){
            if(err){
                error = new verror(error, err + ': Unable to read duty from ' + pwmPrefix[pin.pwm.name]+'/duty_ns' );
                callback(error, null);
            } else {
                resp.freq = 1.0e9 / period;
                resp.value = duty / period;
                callback(null, resp);
            }
        }
    },

    readGPIODirection : function(n, callback) {
        debug("readGPIODirection(" + [n] + ")");
        var resp = {};
        var directionFile = "/sys/class/gpio/gpio" + n + "/direction";
        fs.exists(directionFile,function(exists){
            if(exists){
                fs.readFile(directionFile, 'utf8', onReadDirection);
            } else {
                var err = new verror("Direction file" + directionFile + " deos not exist");
                callback(err, null);
            }
        });

        function onReadDirection(err, direction){
            resp.active = true;
            resp.direction = direction.trim();
            callback(null, resp);
        }
    },

    readPinState : function(pin, callback){
        debug("readPinState(" + pin.key + ")");
        var p = pin.key + "_pinmux";
        bone.find_sysfsFile(p, bone.is_ocp(), p + '.' , onFindPinmux);

        function onFindPinmux(err, data) {
            if(err) {
                callback(err, null);
            } else if(!data.path) {
                err = new verror("Pinmux file for " + p " could not be found");
                callback(err, null);
            } else {
                fs.readFile(data.path + "/state", 'utf8', function(err, state){
                    callback(null, state.trim());
                });
            }
        }
    },

    setPinMode : function(pin, mode, callback) {
        debug('hw.setPinMode(' + [pin.key, mode] + ');');
        var p = pin.key + "_pinmux";
        bone.find_sysfsFile(p, bone.is_ocp(), p + '.', onFindPinmux);

        function onFindPinmux(err, data) {
            if(err) {
                callback(err);
            } else if(!data.path) {
                err = new verror("Pinmux file for " + p " could not be found");
                callback(err);
            } else if(mode == "gpio" || mode == "gpio_pu" || mode == "gpio_pd") {

                gpioFile[pin.key] = '/sys/class/gpio/gpio' + pin.gpio + '/value';

                fs.writeFile( data.path + "/state", mode, onModeComplete);

            } else if(mode == "pwm") {

                fs.writeFile(data.path+"/state", mode, onWriteState); //write mode to the state file...

            } else {

                err = new verror('This mode is currently not supported by octalbonescript');
                callback(err);

            }
        }

        function onWriteState(err){
            if(err){
                err = new verror(err, "onWriteState problem");
                if(typeof callback == 'function') callback(err);
                return;
            }
            pwmPrefix[pin.pwm.name] = '/sys/class/pwm/pwm' + pin.pwm.sysfs;
            fs.exists(pwmPrefix[pin.pwm.name],function(exists) {
                if(!exists){
                    fs.appendFile('/sys/class/pwm/export', pin.pwm.sysfs, onExport); // now export if not exported
                } else {
                    fs.writeFile(pwmPrefix[pin.pwm.name]+'/run', 1, onModeComplete); // now start PWM
                }
            });
        }

        function onExport(err){
            if(err){
                err = new verror(err, "onExport problem");
                if(typeof callback == 'function') callback(err);
                return;
            }
            fs.writeFile(pwmPrefix[pin.pwm.name]+'/run', 1, onModeComplete); // now start PWM
        }

        function onModeComplete(err){
            if(err){
                err = new verror(err, "onComplete problem");
                if(typeof callback == 'function') callback(err);
                return;
            }
            if(typeof callback == 'function') callback(null);
        }
    },

    setLEDPinToGPIO : function(pin, callback) {
        var path = "/sys/class/leds/beaglebone:green:" + pin.led + "/trigger";
        fs.exists(path, function(exists){
            if(exists) {
                fs.writeFile(path, "gpio", onWriteMode);
            } else {
                var err = new verror("Unable to find LED " + pin.led);
                callback(err);
            }
        });

        function onWriteMode(err){
            if(err){
                err = new verror("Unable to write file %s", path);
                callback(err);
            } else {
                callback(null);
            }
        }
    },

    exportGPIOControls : function(pin, direction, callback) {
        debug('hw.exportGPIOControls(' + [pin.key, direction] + ');');
        var n = pin.gpio;
        fs.exists(gpioFile[pin.key], onFileExists);
        
        function onFileExists(exists) {
            if(exists) {
                debug("gpio: " + n + " already exported.");
                fs.writeFile("/sys/class/gpio/gpio" + n + "/direction", direction, onGPIODirectionSet);
            } else {
                debug("exporting gpio: " + n);
                fs.writeFile("/sys/class/gpio/export", String (n), onGPIOExport);
            }
        }
     
        function onGPIOExport(err) {
            if(err) {
                err = new verror(err, "Unable to export GPIO-" + n);
                callback(err);
            } else {
                debug("setting gpio " + n + " direction to " + direction);
                fs.writeFile("/sys/class/gpio/gpio" + n + "/direction", direction, onGPIODirectionSet);
            }
        }

        function onGPIODirectionSet(err) {
            if(err) {
                err = new verror(err, "Unable to set direction of GPIO-" + n);
                callback(err);
            } else {
                callback(null);
            }
        }
    },

    writeGPIOValue : function(pin, value, callback) {
        if(typeof gpioFile[pin.key] == 'undefined') {
            gpioFile[pin.key] = '/sys/class/gpio/gpio' + pin.gpio + '/value';
            if(pin.led) {
                gpioFile[pin.key] = "/sys/class/leds/beaglebone:";
                gpioFile[pin.key] += "green:" + pin.led + "/brightness";
            }
            fs.exists(gpioFile[pin.key],function(exists) {
                if(!exists) {
                    var err = new verror("Unable to find gpio: " + gpioFile[pin.key]);
                    callback(err);
                } else {
                    writeGPIO();
                }
            });
        } else {
            writeGPIO();
        }

        function writeGPIO(){
            debug("writeGPIO gpioFile = " + gpioFile[pin.key]);
            fs.writeFile(gpioFile[pin.key], String( value ), onWriteGPIO);
        }

        function onWriteGPIO(err){
            if(err) {
                err = new verror(err, "Writing to GPIO failed");
                callback(err);
            } else {
                callback(null);
            }
        }
    },

    writeGPIOValueSync : function(pin, value) {
        if(typeof gpioFile[pin.key] == 'undefined') {
            gpioFile[pin.key] = '/sys/class/gpio/gpio' + pin.gpio + '/value';
            if(pin.led) {
                gpioFile[pin.key] = "/sys/class/leds/beaglebone:";
                gpioFile[pin.key] += "green:" + pin.led + "/brightness";
            }
            if(!fs.existsSync(gpioFile[pin.key])) {
                throw new verror("Unable to find gpio: " + gpioFile[pin.key]);
            }
        }
        debug("writeGPIOValueSync gpioFile = " + gpioFile[pin.key]);
        try {
            fs.writeFileSync(gpioFile[pin.key], String( value ) );
        } catch(err){
            throw new verror(err, "Writing to GPIO failed");
        }
    },

    readGPIOValue : function(pin, resp, callback) {
        var gpioFile = '/sys/class/gpio/gpio' + pin.gpio + '/value';
        fs.readFile(gpioFile, onGPIORead);

        function onGPIORead(err, data) {
            if(err) {
                err = new verror(err, 'digitalRead error' );
                callback(err, null);
            } else {
                callback(null, {value : parseInt(data, 2) });
            }
        }
    },

    enableAIN : function(callback) {
        var helper;
        bone.load_dt_sync('cape-bone-iio');

        var ocp = bone.is_ocp();
        if(ocp) {
            helper = bone.find_sysfsFile('helper', ocp, 'helper.');
            if(helper) {
                ainPrefix = helper + '/AIN';
            }
        }
        if(typeof callback == 'function') callback(null, {'path': helper});
            
    },

    readAIN : function(pin, callback) {
        debug('read Analog input '+ pin.key);
        var ainFile = ainPrefix + pin.ain.toString();
        fs.readFile(ainFile, onReadAIN);
        
        function onReadAIN(err, data) {
            if(err) {
                err = new verror(err, 'analogRead error');
                callback(err);
            } else {
                callback(null, { value: parseInt(data, 10) / 1800 });
            }
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
        debug('Stopping PWM');
        fs.writeFile(path+'/run', 0, onStopPWM);
        function onStopPWM(err){
            if(err) {
                err = new verror(err, "Failed to stop PWM" );
                if(typeof callback == 'function') callback(err);
            } else {
                if(typeof callback == 'function') callback(null);
            }
        }
    },

    startPWM : function(pin, pwm, callback){
        var resp = {};
        var path = pwmPrefix[pin.pwm.name];
        debug('Starting PWM');
        fs.writeFile(path+'/run', 1, onStartPWM);
        function onStartPWM(err){
            if(err) {
                err = new verror(err, "Failed to start PWM");
                if(typeof callback == 'function') callback(err);
            } else {
                if(typeof callback == 'function') callback(null);
            }
        }
    },

    writePWMFreqAndValue : function(pin, pwm, freq, value, callback) {
        debug('hw.writePWMFreqAndValue(' + [pin.key,pwm,freq,value] + ');');
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
                err = new verror(err, "Fail to update PWM period" );
                if(typeof callback == 'function') callback(err);
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
                err = new verror(err, "Fail to update PWM duty" );
                if(typeof callback == 'function') callback(err);
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
