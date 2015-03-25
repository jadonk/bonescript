var fs = require('fs');

var watchdogFile = null;
var watchdogTimer = null;

module.exports = {
    start: function() {
        if (watchdogFile !== null) {
            console.warn("Watchdog timer is already running");
            return false;
        }
        fs.open("/dev/watchdog", "w+", function(err, fd) {
            watchdogFile = fd;
            watchdogTimer = setInterval(function() {
                fs.write(watchdogFile, "\n");
            }, 10000);
        });
    },

    stop: function() {
        if (watchdogFile === null) {
            console.warn("Watchdog timer is not running");
            return false;
        }
        clearInterval(watchdogTimer);
        fs.close(watchdogFile);
    }
};