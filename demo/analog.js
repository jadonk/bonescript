var b = require('bonescript');

var inputPin = "P9_36";
var outputPin = "P9_14";

b.pinMode(outputPin, b.ANALOG_OUTPUT);
loop();

function loop() {
    var value = b.analogRead(inputPin);
    b.analogWrite(outputPin, value);
    setTimeout(loop, 1);
}
