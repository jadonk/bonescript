var math = require('../src/functions');
var b = require('bonescript');

var mathFns = Object.getOwnPropertyNames(math);
for (var x in mathFns)
    mathFns[x] = b[mathFns[x]];

function getRandomInt() {
    return Math.floor(Math.random() * 100);
}

exports.testMathFunctions = function (test) {
    test.expect(mathFns.length - 1); //randomseed does not return anything
    for (var x in mathFns) {
        var result = mathFns[x].call(null, getRandomInt(), getRandomInt(), getRandomInt(), getRandomInt(), getRandomInt());
        if (typeof result == 'number') //assuming every math function returns a number
            test.ok(true);
    }
    test.done();
}