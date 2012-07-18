require('bonescript');

inputPin = bone.P9_36;
outputPin = bone.P8_13;

setup = function() {
    pinMode(outputPin, OUTPUT);
};

loop = function() {
    var value = analogRead(inputPin);
    analogWrite(outputPin, value);
};
