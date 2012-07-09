require('bonescript');

inputPin = bone.P9_39;
outputPin = bone.P9_14;

setup = function() {
    pinMode(outputPin, OUTPUT);
};

loop = function() {
    var value = analogRead(inputPin);
    analogWrite(outputPin, value);
};

run(seutp, loop);
