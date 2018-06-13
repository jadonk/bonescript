var server = require('../src/server');
var bonescript = require('../src/bonescript');
var serverEmitter = null;

exports.setUp = function (callback) {
    server.serverStart(8000, process.cwd(), mycb);

    function mycb(emitter) {
        serverEmitter = emitter;
        bonescript.startClient('127.0.0.1', 8000, callback);
    }
};

exports.testRPC1 = function (test) {
    test.expect(1);
    test.doesNotThrow(function () {
        console.log(bonescript);
        var b = bonescript.require('bonescript');
        b.getPlatform(function (platform) {
            console.log('Name: ' + platform.name);
            console.log('Version: ' + platform.bonescript);
        });
    });
    test.done();
};