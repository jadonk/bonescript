//process.env.DEBUG = true;

exports.testSanity1 = function (test) {
    test.expect(1);
    test.doesNotThrow(function () {
        var b = require('bonescript');

        console.log('Name: ' + b.getPlatform().name);
        console.log('Version: ' + b.getPlatform().bonescript);
    });
    test.done();
}