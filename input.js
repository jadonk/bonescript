var bb = require('./bonescript');

var outputPin = bone.P8_3;
var inputPin = bone.P8_5;

var handler = function(pin, value) {
    console.log('inputPin ' + pin.key + ' changed to: ' + value);
};

setup = function() {
    console.log('inputPin mode: ' + JSON.stringify(getPinMode(inputPin)));
    console.log('outputPin mode: ' + JSON.stringify(getPinMode(outputPin)));
    pinMode(inputPin, INPUT);
    pinMode(outputPin, OUTPUT);
    console.log('inputPin mode: ' + JSON.stringify(getPinMode(inputPin)));
    console.log('outputPin mode: ' + JSON.stringify(getPinMode(outputPin)));
    attachInterrupt(inputPin, handler, CHANGE);
};

loop = function() {
    digitalWrite(outputPin, HIGH);
    delay(1000);
    digitalWrite(outputPin, LOW);
    delay(1000);
};

bb.run();