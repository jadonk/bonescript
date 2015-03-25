// Copyright Aditya Patadia, Octal Consulting LLP
var fs = require('fs');
var debug = require('debug')('bone');
var bone = require('./bone');
var verror = require("verror");
var eeprom = require('./eeprom');

module.exports = {

    watchdog: require("./watchdog"),

    pwm: require("./pwm"),

    digital: require("./digital"),

    analog: require("./analog"),

    readPinState: function(pin, callback) {
        debug("readPinState(" + pin.key + ")");
        var p = pin.key + "_pinmux";
        bone.find_sysfsFile(p, bone.is_ocp(), p + '.', onFindPinmux);

        function onFindPinmux(err, data) {
            if (err) {
                callback(err, null);
            } else if (!data.path) {
                err = new verror("Pinmux file for " + p + " could not be found");
                callback(err, null);
            } else {
                fs.readFile(data.path + "/state", 'utf8', function(err, state) {
                    callback(null, state.trim());
                });
            }
        }
    },

    setPinMode: function(pin, mode, callback) {
        if (mode == "gpio" || mode == "gpio_pu" || mode == "gpio_pd") {

            module.exports.digital.setPinMode(pin, mode, callback);

        } else if (mode == "pwm") {

            module.exports.pwm.setPinMode(pin, mode, callback);

        } else {

            err = new verror('This mode is currently not supported by octalbonescript');
            callback(err);

        }
    },

    setPinModeSync: function(pin, mode) {
        if (mode == "gpio" || mode == "gpio_pu" || mode == "gpio_pd") {

            return module.exports.digital.setPinModeSync(pin, mode);

        } else if (mode == "pwm") {

            return module.exports.pwm.setPinModeSync(pin, mode);

        } else {

            return new verror('This mode is currently not supported by octalbonescript');

        }
    },

    readEeproms: function(eeproms) {
        var EepromFiles = {
            '/sys/bus/i2c/drivers/at24/0-0050/eeprom': {
                type: 'bone'
            },
            '/sys/bus/i2c/drivers/at24/2-0054/eeprom': {
                type: 'cape'
            },
            '/sys/bus/i2c/drivers/at24/2-0055/eeprom': {
                type: 'cape'
            },
            '/sys/bus/i2c/drivers/at24/2-0056/eeprom': {
                type: 'cape'
            },
            '/sys/bus/i2c/drivers/at24/2-0057/eeprom': {
                type: 'cape'
            }
        };
        eeproms = eeprom.readEeproms(EepromFiles);
        return (eeproms);
    },

    readPlatform: function(platform) {
        var eeproms = eeprom.readEeproms({
            '/sys/bus/i2c/drivers/at24/0-0050/eeprom': {
                type: 'bone'
            }
        });
        var x = eeproms['/sys/bus/i2c/drivers/at24/0-0050/eeprom'];
        if (x.boardName == 'A335BONE') platform.name = 'BeagleBone';
        if (x.boardName == 'A335BNLT') platform.name = 'BeagleBone Black';
        platform.version = x.version;
        if (!platform.version.match(/^[\040-\176]*$/)) delete platform.version;
        platform.serialNumber = x.serialNumber;
        if (!platform.serialNumber.match(/^[\040-\176]*$/)) delete platform.serialNumber;
        try {
            platform.dogtag = fs.readFileSync('/etc/dogtag', 'ascii');
        } catch (ex) {}
        return (platform);
    }
};