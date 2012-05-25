var bb = require('bonescript');

var outputPin = bone.P8_3;
var inputPin = bone.P8_5;

setup = function() {
    console.log('Please connect ' + inputPin.key + ' to ' + outputPin.key +
        ' with a 1kohm resistor');
    pinMode(inputPin, INPUT);
    pinMode(outputPin, OUTPUT);
    digitalWrite(outputPin, LOW);
    attachInterrupt(inputPin, CHANGE, function(pin, value) {
        console.log(pin.key + ' changed to ' + ((value == HIGH) ? 'HIGH' : 'LOW'));
    });
};

loop = function() {
    digitalWrite(outputPin, HIGH);
    delay(500);
    digitalWrite(outputPin, LOW);
    delay(500);
};

bb.run();
