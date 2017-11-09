//process.env.DEBUG = true;
var bone = require('bonescript').bone;

var expectedResults = [];

expectedResults.push({
    "name": "LEDs",
    "search": /^USR/,
    "keys": ["USR0", "USR1", "USR2", "USR3"]
});

var pbKeys = [];
for(var i=1; i<=36; i++) {
    pbKeys.push("P1_" + i);
    pbKeys.push("P2_" + i);
}
expectedResults.push({
    "name": "PocketBeagleHeaders",
    "search": /^P[12]/,
    "keys": pbKeys
});

var boneKeys = [];
for(var i=1; i<=46; i++) {
    boneKeys.push("P8_" + i);
    boneKeys.push("P9_" + i);
}
boneKeys.push("P9_15B");
boneKeys.push("P9_41B");
boneKeys.push("P9_42B");
expectedResults.push({
    "name": "BeagleBoneHeaders",
    "search": /^P[89]/,
    "keys": boneKeys
});

var results = {};

for(var i=0; i < expectedResults.length; i++) {
    var er = expectedResults[i];
    exports['testBoneGetPinKeys' + er.name] = makeTest(i);
}

function makeTest(i) {
    var search = expectedResults[i].search;
    var expected = expectedResults[i].keys.sort(bone.naturalCompare);
    return(function(test) {
        test.expect(2);
        test.doesNotThrow(function() {
            results = bone.getPinKeys(search).sort(bone.naturalCompare);
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
