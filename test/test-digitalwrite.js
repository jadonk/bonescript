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
pinKeys = pinKeys.concat(['USR0', 'USR1', 'USR2', 'USR3']);
exports.testdigitalwrite1 = function (test) {
    test.expect(pinKeys.length);
    for (var x in pinKeys) {
        test.doesNotThrow(function () {
            b.digitalWrite(pinKeys[x], b.HIGH);
        });
    }
    test.done();
}
exports.testdigitalwrite2 = function (test) {
    test.expect(pinKeys.length);
    for (var x in pinKeys) {
        b.digitalWrite(pinKeys[x], b.LOW, function () {
            test.ok(true);
        });
        if (x == pinKeys.length - 1)
            test.done();
    }
}