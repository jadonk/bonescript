var fs = require('fs');
var debug = require('debug')('bone');
var bone = require('./bone');
var verror = require("verror");

var ainPrefix = "";

module.exports = {

    enable: function(callback) {
        bone.load_dt_sync('BB-ADC');
        var helper = bone.find_sysfsFile('helper', '/sys/devices/platform/ocp', '44e0d000.tscadc');
        if (helper) {
          ainPrefix = helper + '/TI-am335x-adc/iio:device0/in_voltage';
          debug('analog enable. Path = ' + ainPrefix);
        }
        if (typeof callback == 'function') callback(null, {
            'path': helper
        });

    },

    read: function(pin, callback) {
        debug('read Analog input ' + pin.key);
        var ainFile = ainPrefix + pin.ain.toString() + '_raw';
        fs.readFile(ainFile, onReadAIN);

        function onReadAIN(err, data) {
            if (err) {
                err = new verror(err, 'analogRead error');
                callback(err, null);
            } else {
                callback(null, parseInt(data, 10) / 4096);
            }
        }
    }
};
