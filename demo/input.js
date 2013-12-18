var b = require('bonescript');

var outputPin = "P9_14";
var inputPin = "P8_19";
var ledPin = "USR3";
var mydelay = 100;
var state = b.LOW;

console.log('Please connect ' + inputPin + ' to ' + outputPin +
    ' with a 1kohm resistor');
b.pinMode(inputPin, b.INPUT);
b.pinMode(outputPin, b.OUTPUT);
b.digitalWrite(outputPin, b.LOW);
b.pinMode(ledPin, b.OUTPUT);
b.attachInterrupt(inputPin, setLED, b.CHANGE);
toggle();

function setLED(x) {
    b.digitalWrite(ledPin, x.value);
}

function toggle() {
    state = (state == b.LOW) ? b.HIGH : b.LOW;
    b.digitalWrite(outputPin, state);
    setTimeout(toggle, mydelay);
}
