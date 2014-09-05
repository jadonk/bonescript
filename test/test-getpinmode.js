//process.env.DEBUG = true;
var b = require('bonescript');

exports.testGetPinModeP8_1 = function(test) {
    test.expect(1);
    test.doesNotThrow(function() {
        console.log('P8_1: ' + JSON.stringify(b.getPinMode('P8_1')));
    });
    test.done();
}
