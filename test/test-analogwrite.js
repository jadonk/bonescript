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
exports.testanalogwrite1 = function (test) {
    test.expect(pinKeys.length);
    for (var x in pinKeys) {
        test.doesNotThrow(function () {
            b.analogWrite(pinKeys[x], Math.random());
        });
    }
    test.done();
}
exports.testanalogwrite2 = function (test) {
    test.expect(pinKeys.length);
    for (var x in pinKeys) {
        b.analogWrite(pinKeys[x], Math.random(), 2000, function (x) {
            test.ok(true);
        });
        if (x == pinKeys.length - 1)
            test.done();
    }
}