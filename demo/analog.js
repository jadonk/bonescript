var b = require('bonescript');

inputPin = "P9_36";
outputPin = "P8_13";

b.pinMode(outputPin, b.OUTPUT);
loop();

function loop() {
    var value = b.analogRead(inputPin);
    b.analogWrite(outputPin, value);
    setTimeout(loop, 1);
};
