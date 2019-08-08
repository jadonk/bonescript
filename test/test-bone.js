//process.env.DEBUG = true;
var bone = require('bonescript').bone;

var expectedResults = [];

expectedResults.push({
    "name": "LEDs",
    "search": /^USR/,
    "keys": ["USR0", "USR1", "USR2", "USR3"]
});

var pbKeys = [];
for (var i = 1; i <= 36; i++) {
    pbKeys.push("P1_" + i);
    pbKeys.push("P2_" + i);
}
expectedResults.push({
    "name": "PocketBeagleHeaders",
    "search": /^P[12]/,
    "keys": pbKeys
});

var boneKeys = [];
for (var i = 1; i <= 46; i++) {
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

var ainKeys = [];
for (var i = 0; i <= 7; i++) {
    ainKeys.push("A" + i);
}
expectedResults.push({
    "name": "AnalogInPins",
    "search": /^A[0-7]/,
    "keys": ainKeys
});

var gpioKeys = [];
for (var i = 0; i <= 117; i++) {
    gpioKeys.push("GPIO_" + i);
}
expectedResults.push({
    "name": "GPIOPins",
    "search": /^GPIO_/,
    "keys": gpioKeys
});
// removes must be done high-to-low to keep indexes valid
gpioKeys.splice(108, 1); // remove GPIO3_12
gpioKeys.splice(107, 1); // remove GPIO3_11
gpioKeys.splice(25, 1); // remove GPIO0_25
gpioKeys.splice(24, 1); // remove GPIO0_24

var eepromKeys = [];
for (var i = 0; i < 74; i++) {
    eepromKeys.push("EEPROM_" + i);
}
expectedResults.push({
    "name": "EEPROM",
    "search": /^EEPROM_/,
    "keys": eepromKeys
});

var blueKeys = [];
for (var i = 1; i <= 6; i++) {
    blueKeys.push("GP0_" + i);
    blueKeys.push("GP1_" + i);
    blueKeys.push("S1_1_" + i);
    blueKeys.push("S1_2_" + i);
    blueKeys.push("ADC_" + i);
}
for (var i = 2; i <= 6; i++) {
    blueKeys.push("GPS_" + i);
}
for (var i = 1; i <= 4; i++) {
    for (var j = 1; j <= 4; j++) {
        blueKeys.push("E" + j + "_" + i);
    }
    blueKeys.push("I2C_" + i);
    blueKeys.push("UT0_" + i);
    blueKeys.push("UT1_" + i);
    blueKeys.push("UT5_" + i);
}
for (var i = 1; i <= 3; i++) {
    blueKeys.push("DSM2_" + i);
}
blueKeys.push("RED");
blueKeys.push("GREEN");
blueKeys.push("WIFI");
blueKeys.push("BAT25");
blueKeys.push("BAT50");
blueKeys.push("BAT75");
blueKeys.push("BAT100");
blueKeys.push("PAUSE");
blueKeys.push("MODE");
expectedResults.push({
    "name": "BeagleBoneBlue",
    "search": /^((E[1234]|GP[01]|GPS|S1_[12]|I2C|UT[015]|ADC|DSM2)_|RED|GREEN|WIFI|BAT|PAUSE|MODE)/,
    "keys": blueKeys
});

var results = {};

for (var i = 0; i < expectedResults.length; i++) {
    var er = expectedResults[i];
    exports['testBoneGetPinKeys' + er.name] = makeTest(i);
}

function makeTest(i) {
    var search = expectedResults[i].search;
    var expected = expectedResults[i].keys.sort(bone.naturalCompare);
    return (function (test) {
        test.expect(2);
        test.doesNotThrow(function () {
            results = bone.getPinKeys(search).sort(bone.naturalCompare);
        });
        test.ok(compareResults(results, expected));
        test.done();
    });
}

function compareResults(results, expected) {
    console.log("results = " + JSON.stringify(results));
    console.log("expectedResults = " + JSON.stringify(expected));
    for (i in expected) {
        if (results[i] != expected[i]) return (false);
    }
    return (true);
}