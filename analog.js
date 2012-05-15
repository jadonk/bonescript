var bb = require('./bonescript');

var inputPin = bone.P9_39;
var outputPin = bone.P9_14;

setup = function() {
    pinMode(outputPin, OUTPUT);
};

loop = function() {
    var value = analogRead(inputPin);
    analogWrite(outputPin, value);
};

bb.run();