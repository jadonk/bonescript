var b = require('bonescript');

var pinKeys = [];
for (var i = 1; i <= 36; i++) {
    pinKeys.push("P1_" + i);
    pinKeys.push("P2_" + i);
}
for (var i = 1; i <= 46; i++) {
    pinKeys.push("P8_" + i);
    pinKeys.push("P9_" + i);
}
for (var i = 0; i <= 7; i++) {
    pinKeys.push("A" + i);
}
pinKeys = pinKeys.concat(['USR0', 'USR1', 'USR2', 'USR3']);
exports.testpinMode1 = function (test) {
    test.expect(pinKeys.length);
    for (var x in pinKeys) {
        test.doesNotThrow(function () {
            b.pinMode(pinKeys[x], b.OUTPUT);
            b.pinMode(pinKeys[x], b.INPUT);
            b.pinMode(pinKeys[x], b.INPUT_PULLUP);
            b.pinMode(pinKeys[x], b.ANALOG_OUTPUT);
        });
    }
    test.done();
}
exports.testpinMode2 = function (test) {
    test.expect(pinKeys.length);
    for (var x in pinKeys) {
        b.pinMode(pinKeys[x], b.OUTPUT, 7, 'pullup', 'fast', function (x) {
            test.ok(x.value && !x.err);
        });
        if (x == pinKeys.length - 1)
            test.done();
    }
}
exports.testpinMode3 = function (test) {
    test.expect(pinKeys.length);
    for (var x in pinKeys) {
        b.pinMode(pinKeys[x], b.OUTPUT, 7, 'pullup', 'fast', function (err, value) {
            test.ok(value && !err);
        });
        if (x == pinKeys.length - 1)
            test.done();
    }
}