var fs = require('fs');
var debug = require('debug')('bone');
var bone = require('./bone');
var verror = require("verror");

var ainPrefix = "";

module.exports = {

    enable: function(callback) {
        var helper;
        bone.load_dt_sync('cape-bone-iio');

        var ocp = bone.is_ocp();
        if (ocp) {
            helper = bone.find_sysfsFile('helper', ocp, 'helper.');
            if (helper) {
                ainPrefix = helper + '/AIN';
            }
        }
        if (typeof callback == 'function') callback(null, {
            'path': helper
        });

    },

    read: function(pin, callback) {
        debug('read Analog input ' + pin.key);
        var ainFile = ainPrefix + pin.ain.toString();
        fs.readFile(ainFile, onReadAIN);

        function onReadAIN(err, data) {
            if (err) {
                err = new verror(err, 'analogRead error');
                callback(err, null);
            } else {
                callback(null, parseInt(data, 10) / 1800);
            }
        }
    }
};