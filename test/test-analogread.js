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
exports.testanalogread1 = function (test) {
    test.expect(pinKeys.length);
    for (var x in pinKeys) {
        var y = b.analogRead(pinKeys[x]);
        test.ok(typeof y == 'number');
    }
    test.done();
}
exports.testanalogread2 = function (test) {
    test.expect(pinKeys.length);
    for (var x in pinKeys) {
        b.analogRead(pinKeys[x], function (x) {
            test.ok(typeof x.value == 'number' && !x.err);
        });
        if (x == pinKeys.length - 1)
            test.done();
    }
}
exports.testanalogread3 = function (test) {
    test.expect(pinKeys.length);
    for (var x in pinKeys) {
        b.analogRead(pinKeys[x], function (err, value) {
            test.ok(typeof value == 'number' && !err);
        });
        if (x == pinKeys.length - 1)
            test.done();
    }
}