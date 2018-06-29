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
exports.testdigitalRead1 = function (test) {
    test.expect(pinKeys.length);
    for (var x in pinKeys) {
        var y = b.digitalRead(pinKeys[x]);
        test.ok(typeof y == 'number');
    }
    test.done();
}
exports.testdigitalRead2 = function (test) {
    test.expect(pinKeys.length);
    for (var x in pinKeys) {
        b.digitalRead(pinKeys[x], function (x) {
            test.ok(typeof x.value == 'number' && !x.err);
        });
        if (x == pinKeys.length - 1)
            test.done();
    }
}
exports.testdigitalRead3 = function (test) {
    test.expect(pinKeys.length);
    for (var x in pinKeys) {
        b.digitalRead(pinKeys[x], function (err, value) {
            test.ok(typeof value == 'number' && !err);
        });
        if (x == pinKeys.length - 1)
            test.done();
    }
}