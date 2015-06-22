var fs = require('fs');
var debug = require('debug')('bone');
var bone = require('./bone');
var verror = require("verror");

var gpioFile = {};

module.exports = {

    setPinMode: function(pin, mode, callback) {
        debug('digital.setPinMode(' + [pin.key, mode] + ');');
        var p = pin.key + "_pinmux";
        bone.find_sysfsFile(p, bone.is_ocp(), p + '.', onFindPinmux);

        function onFindPinmux(err, data) {
            if (err) {
                callback(err);
            } else if (!data.path) {
                err = new verror("Pinmux file for " + p + " could not be found");
                callback(err);
            } else {
                gpioFile[pin.key] = '/sys/class/gpio/gpio' + pin.gpio + '/value';

                fs.writeFile(data.path + "/state", mode, onModeComplete);
            }
        }

        function onModeComplete(err) {
            if (err) {
                err = new verror(err, "onComplete problem");
                if (typeof callback == 'function') callback(err);
                return;
            }
            if (typeof callback == 'function') callback(null);
        }
    },

    setPinModeSync: function(pin, mode) {
        debug('digital.setPinModeSync(' + [pin.key, mode] + ');');
        var p = pin.key + "_pinmux";
        var path = bone.find_sysfsFile(p, bone.is_ocp(), p + '.');

        gpioFile[pin.key] = '/sys/class/gpio/gpio' + pin.gpio + '/value';

        fs.writeFileSync(path + "/state", mode);
        return true;
    },

    readDirection: function(n, callback) {
        debug("readGPIODirection(" + [n] + ")");
        var resp = {};
        var directionFile = "/sys/class/gpio/gpio" + n + "/direction";
        fs.exists(directionFile, function(exists) {
            if (exists) {
                fs.readFile(directionFile, 'utf8', onReadDirection);
            } else {
                var err = new verror("Direction file" + directionFile + " deos not exist");
                callback(err, null);
            }
        });

        function onReadDirection(err, direction) {
            resp.active = true;
            resp.direction = direction.trim();
            callback(null, resp);
        }
    },


    setLEDPinToGPIO: function(pin, callback) {
        var path = "/sys/class/leds/beaglebone:green:" + pin.led + "/trigger";
        fs.exists(path, function(exists) {
            if (exists) {
                fs.writeFile(path, "gpio", onWriteMode);
            } else {
                var err = new verror("Unable to find LED " + pin.led);
                callback(err);
            }
        });

        function onWriteMode(err) {
            if (err) {
                err = new verror("Unable to write file %s", path);
                callback(err);
            } else {
                callback(null);
            }
        }
    },

    setLEDPinToGPIOSync: function(pin) {
        var path = "/sys/class/leds/beaglebone:green:" + pin.led + "/trigger";
        var exists = fs.existsSync(path);

        if (exists) {
            fs.writeFileSync(path, "gpio");
            return true;
        } else {
            return new verror("Unable to find LED " + pin.led);
        }
    },


    exportControls: function(pin, direction, callback) {
        debug('hw.exportGPIOControls(' + [pin.key, direction] + ');');
        var n = pin.gpio;
        fs.exists(gpioFile[pin.key], onFileExists);

        function onFileExists(exists) {
            if (exists) {
                debug("gpio: " + n + " already exported.");
                fs.writeFile("/sys/class/gpio/gpio" + n + "/direction", direction, onGPIODirectionSet);
            } else {
                debug("exporting gpio: " + n);
                fs.writeFile("/sys/class/gpio/export", String(n), onGPIOExport);
            }
        }

        function onGPIOExport(err) {
            if (err) {
                err = new verror(err, "Unable to export GPIO-" + n);
                callback(err);
            } else {
                debug("setting gpio " + n + " direction to " + direction);
                fs.writeFile("/sys/class/gpio/gpio" + n + "/direction", direction, onGPIODirectionSet);
            }
        }

        function onGPIODirectionSet(err) {
            if (err) {
                err = new verror(err, "Unable to set direction of GPIO-" + n);
                callback(err);
            } else {
                callback(null);
            }
        }
    },

    exportControlsSync: function(pin, direction) {
        debug('hw.exportGPIOControls(' + [pin.key, direction] + ');');
        var n = pin.gpio;

        var exists = fs.existsSync(gpioFile[pin.key]);

        if (exists) {
            debug("gpio: " + n + " already exported.");
            fs.writeFileSync("/sys/class/gpio/gpio" + n + "/direction", direction);
        } else {
            debug("exporting gpio: " + n);
            fs.writeFileSync("/sys/class/gpio/export", String(n));
            fs.writeFileSync("/sys/class/gpio/gpio" + n + "/direction", direction);
        }
        return true;
    },

    write: function(pin, value, callback) {
        if (typeof gpioFile[pin.key] == 'undefined') {
            gpioFile[pin.key] = '/sys/class/gpio/gpio' + pin.gpio + '/value';
            if (pin.led) {
                gpioFile[pin.key] = "/sys/class/leds/beaglebone:";
                gpioFile[pin.key] += "green:" + pin.led + "/brightness";
            }
            fs.exists(gpioFile[pin.key], function(exists) {
                if (!exists) {
                    var err = new verror("Unable to find gpio: " + gpioFile[pin.key]);
                    callback(err);
                } else {
                    writeGPIO();
                }
            });
        } else {
            writeGPIO();
        }

        function writeGPIO() {
            debug("writeGPIO gpioFile = " + gpioFile[pin.key]);
            fs.writeFile(gpioFile[pin.key], String(value), onWriteGPIO);
        }

        function onWriteGPIO(err) {
            if (err) {
                err = new verror(err, "Writing to GPIO failed");
                callback(err);
            } else {
                callback(null);
            }
        }
    },


    writeSync: function(pin, value) {
        if (typeof gpioFile[pin.key] == 'undefined') {
            gpioFile[pin.key] = '/sys/class/gpio/gpio' + pin.gpio + '/value';
            if (pin.led) {
                gpioFile[pin.key] = "/sys/class/leds/beaglebone:";
                gpioFile[pin.key] += "green:" + pin.led + "/brightness";
            }
            if (!fs.existsSync(gpioFile[pin.key])) {
                throw new verror("Unable to find gpio: " + gpioFile[pin.key]);
            }
        }
        debug("writeGPIOValueSync gpioFile = " + gpioFile[pin.key]);
        try {
            fs.writeFileSync(gpioFile[pin.key], String(value));
        } catch (err) {
            throw new verror(err, "Writing to GPIO failed");
        }
    },

    read: function(pin, callback) {
        var gpioFile = '/sys/class/gpio/gpio' + pin.gpio + '/value';
        fs.readFile(gpioFile, onGPIORead);

        function onGPIORead(err, data) {
            if (err) {
                err = new verror(err, 'digitalRead error');
                callback(err, null);
            } else {
                callback(null, parseInt(data, 2));
            }
        }
    },

    writeEdge: function(pin, mode) {
        fs.writeFileSync('/sys/class/gpio/gpio' + pin.gpio + '/edge', mode);
        var resp = {};
        resp.gpioFile = '/sys/class/gpio/gpio' + pin.gpio + '/value';
        resp.valuefd = fs.openSync(resp.gpioFile, 'r');
        resp.value = new Buffer(1);

        return (resp);
    }
};
