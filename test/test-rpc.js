var server = require('../src/server');
var bonescript = require('../src/bonescript');
var serverEmitter = null;

exports.testRPC = function (test) {
    server.serverStart(8000, process.cwd(), mycb);
    test.expect(8);

    function getPlatformTest() {
        console.log('here');
        var b = bonescript.require('bonescript');
        //console.log("" + b);
        b.getPlatform(function (platform) {
            console.log("***getPlatformTest***");
            console.log(platform);
            console.log('Name: ' + platform.name);
            console.log('Version: ' + platform.bonescript);
            test.ok(true);
            pinModeTest();
        });
    }

    function pinModeTest() {
        var b = bonescript.require('bonescript');
        b.pinMode("P8_13", b.OUTPUT, 7, 'pullup', 'fast', printStatus);

        function printStatus(x) {
            console.log("***pinModeTest***");
            console.log('value = ' + x.value);
            console.log('err = ' + x.err);
            test.ok(true);
            getPinModeTest();
        }
    }

    function getPinModeTest() {
        var b = bonescript.require('bonescript');
        b.getPinMode("P8_13", printPinMux);

        function printPinMux(x) {
            console.log("***getPinModeTest***");
            console.log('mux = ' + x.mux);
            console.log('pullup = ' + x.pullup);
            console.log('slew = ' + x.slew);
            console.log('options = ' + x.options.join(','));
            console.log('err = ' + x.err);
            test.ok(true);
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
            digitalReadTest();
        }
    }

    function digitalReadTest() {
        var b = bonescript.require('bonescript');
        b.digitalRead('P8_19', printStatus);

        function printStatus(x) {
            console.log("***digitalReadTest***");
            console.log('x.value = ' + x.value);
            console.log('x.err = ' + x.err);
            test.ok(true);
            analogReadTest();
        }
    }

    function analogReadTest() {
        var b = bonescript.require('bonescript');
        b.analogRead('P9_36', printStatus);

        function printStatus(x) {
            console.log("***analogReadTest***");
            console.log('x.value = ' + x.value);
            console.log('x.err = ' + x.err);
            test.ok(true);
            attachInterruptTest()
        }
    }

    function attachInterruptTest() {
        var b = bonescript.require('bonescript');
        b.attachInterrupt('P8_19', true, b.CHANGE, interruptCallback);

        function interruptCallback(x) {
            console.log(JSON.stringify(x));
            test.ok(true);
            readTextFileTest();
        }
    }

    function readTextFileTest() {
        var b = bonescript.require('bonescript');
        b.readTextFile('/etc/fstab', printStatus);

        function printStatus(x) {
            console.log('x.data = ' + x.data);
            console.log('x.err = ' + x.err);
            test.ok(true);
            test.done();
        }
    }



    function mycb(emitter) {
        serverEmitter = emitter;
        bonescript.startClient('127.0.0.1', 8000, getPlatformTest);
    }
}