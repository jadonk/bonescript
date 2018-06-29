var server = require('bonescript');
var bonescript = require('../src/bonescript');
var myserver = null;

exports.setUp = function (callback) {
    server.serverStart(8000, process.cwd(), null, mycb);

    function mycb(serverObj) {
        myserver = serverObj.server;
        callback();
    }
};

exports.testRPC_callbacks = function (test) {
    test.expect(15);

    bonescript.startClient({
        address: '127.0.0.1',
        port: 8000
    }, getPlatformTest_oldstyle);

    function getPlatformTest_oldstyle() {
        var b = bonescript.require('bonescript');
        b.getPlatform(function (platform) {
            console.log("***getPlatformTest_oldstyle***");
            console.log(platform);
            console.log('Name: ' + platform.name);
            console.log('Version: ' + platform.bonescript);
            getPlatformTest_nodestyle(platform);
        });
    }

    function getPlatformTest_nodestyle(platform_) {
        console.log('here');
        var b = bonescript.require('bonescript');
        b.getPlatform(function (err, platform) {
            console.log("***getPlatformTest_nodestyle***");
            console.log(platform);
            console.log('Name: ' + platform.name);
            console.log('Version: ' + platform.bonescript);
            test.equals(platform.name, platform_.name);
            test.equals(platform.bonescript, platform_.bonescript);
            pinModeTest_oldstyle();
        });
    }

    function pinModeTest_oldstyle() {
        var b = bonescript.require('bonescript');
        b.pinMode("P8_13", b.OUTPUT, 7, 'pullup', 'fast', printStatus);

        function printStatus(x) {
            console.log("***pinModeTest_oldstyle***");
            console.log('value = ' + x.value);
            console.log('err = ' + x.err);
            pinModeTest_nodestyle(x);
        }
    }

    function pinModeTest_nodestyle(x) {
        var b = bonescript.require('bonescript');
        b.pinMode("P8_13", b.OUTPUT, 7, 'pullup', 'fast', printStatus);

        function printStatus(err, value) {
            console.log("***pinModeTest_nodestyle***");
            console.log('value = ' + value);
            console.log('err = ' + err);
            test.equals(x.err, err);
            test.equals(x.value, value);
            getPinModeTest_oldstyle();
        }
    }

    function getPinModeTest_oldstyle() {
        var b = bonescript.require('bonescript');
        b.getPinMode("P8_13", printPinMux);

        function printPinMux(x) {
            console.log("***getPinModeTest_oldstyle***");
            console.log('mux = ' + x.mux);
            console.log('pullup = ' + x.pullup);
            console.log('slew = ' + x.slew);
            console.log('options = ' + x.options.join(','));
            console.log('err = ' + x.err);
            getPinModeTest_nodestyle(x)
        }
    }

    function getPinModeTest_nodestyle(x) {
        var b = bonescript.require('bonescript');
        b.getPinMode("P8_13", printPinMux);

        function printPinMux(err, resp) {
            console.log("***getPinModeTest_nodestyle***");
            console.log('mux = ' + resp.mux);
            console.log('pullup = ' + resp.pullup);
            console.log('slew = ' + resp.slew);
            console.log('options = ' + resp.options.join(','));
            console.log('err = ' + resp.err);
            test.equals(x.mux, resp.mux);
            test.equals(x.pullup, resp.pullup);
            test.equals(x.slew, resp.slew);
            test.equals(x.options.join(','), resp.options.join(','));
            digitalWriteTest();
        }
    }

    function digitalWriteTest() {
        var b = bonescript.require('bonescript');
        b.digitalWrite('USR0', b.HIGH, printErr);

        function printErr(x) {
            console.log("***digitalWriteTest***");
            console.log('err = ' + x.err);
            test.ok(true);
            digitalReadTest_oldstyle();
        }
    }

    function digitalReadTest_oldstyle() {
        var b = bonescript.require('bonescript');
        b.digitalRead('P8_19', printStatus);

        function printStatus(x) {
            console.log("***digitalReadTest_oldstyle***");
            console.log('x.value = ' + x.value);
            console.log('x.err = ' + x.err);
            digitalReadTest_nodestyle(x)
        }
    }

    function digitalReadTest_nodestyle(x) {
        var b = bonescript.require('bonescript');
        b.digitalRead('P8_19', printStatus);

        function printStatus(err, value) {
            console.log("***digitalReadTest_nodestyle***");
            console.log('x.value = ' + value);
            console.log('x.err = ' + err);
            test.equals(x.value, value);
            analogWriteTest()
        }
    }


    function analogWriteTest() {
        var b = bonescript.require('bonescript');
        b.analogWrite('P9_14', 0.7, 2000, printJSON);

        function printJSON(x) {
            console.log("***analogWriteTest***");
            console.log(JSON.stringify(x));
            test.ok(true);
            analogReadTest_oldstyle();

        }
    }

    function analogReadTest_oldstyle() {
        var b = bonescript.require('bonescript');
        b.analogRead('P9_36', printStatus);

        function printStatus(x) {
            console.log("***analogReadTest_oldstyle***");
            console.log('x.value = ' + x.value);
            console.log('x.err = ' + x.err);
            analogReadTest_nodestyle(x);
        }
    }

    function analogReadTest_nodestyle(x) {
        var b = bonescript.require('bonescript');
        b.analogRead('P9_36', printStatus);

        function printStatus(err, value) {
            console.log("***analogReadTest_nodestyle***");
            console.log('x.value = ' + value);
            console.log('x.err = ' + err);
            test.equals(x.value, value);
            attachInterruptTest_oldstyle()
        }
    }

    function attachInterruptTest_oldstyle() {
        var b = bonescript.require('bonescript');
        b.attachInterrupt('P8_19', true, b.CHANGE, interruptCallback);

        function interruptCallback(x) {
            console.log("***attachInterruptTest_oldstyle***");
            console.log(JSON.stringify(x));
            attachInterruptTest_nodestyle(x)
        }
    }

    function attachInterruptTest_nodestyle(x) {
        var b = bonescript.require('bonescript');
        b.attachInterrupt('P8_19', true, b.CHANGE, interruptCallback);

        function interruptCallback(err, resp) {
            console.log("***attachInterruptTest_nodestyle***");
            console.log(JSON.stringify(resp));
            test.equals(x.pin.name, resp.pin.name);
            readTextFileTest_oldstyle();
        }
    }

    function readTextFileTest_oldstyle() {
        var b = bonescript.require('bonescript');
        b.readTextFile('/etc/fstab', printStatus);

        function printStatus(x) {
            console.log("***readTextFileTest_oldstyle***");
            console.log('x.data = ' + x.data);
            console.log('x.err = ' + x.err);
            readTextFileTest_nodestyle(x);
        }
    }

    function readTextFileTest_nodestyle(x) {
        var b = bonescript.require('bonescript');
        b.readTextFile('/etc/fstab', printStatus);

        function printStatus(err, data) {
            console.log("***readTextFileTest_nodestyle***");
            console.log('x.data = ' + data);
            console.log('x.err = ' + err);
            test.equals(x.data, data);
            test.equals(x.err, err);
            myserver.close();
            test.done();
        }
    }
}