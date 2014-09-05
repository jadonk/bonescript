//process.env.DEBUG = true;
var b = require('bonescript');

var expectedResults = [
    {"pin":"P8_1","name":"DGND"},
    {"pin":"P8_2","name":"DGND"},
    {"pin":"P8_3","name":"GPIO1_6"},
    {"pin":"P8_4","name":"GPIO1_7"},
    {"pin":"P8_5","name":"GPIO1_2"},
    {"pin":"P8_6","name":"GPIO1_3"},
];
var results = {};

for(var i=0; i < expectedResults.length; i++) {
    var er = expectedResults[i];
    exports['testGetPinMode' + er.pin] = makeTest(i);
}

function makeTest(i) {
    var pin = expectedResults[i].pin;
    var expected = expectedResults[i];
    return(function(test) {
        test.expect(2);
        test.doesNotThrow(function() {
            results = b.getPinMode(pin);
        });
        test.ok(compareResults(results, expected));
        test.done();
    });
}

function compareResults(results, expected) {
    console.log("results = " + JSON.stringify(results));
    console.log("expectedResults = " + JSON.stringify(expected));
    for(i in expected) {
        if(results[i] != expected[i]) return(false);
    }
    return(true);
}
