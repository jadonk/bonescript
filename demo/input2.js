var b = require('bonescript');

var outputPin = "P9_14";
var inputPin = "P8_19";
var outputPin2 = "P9_16";
var inputPin2 = "P9_15";
var ledPin = "USR3";
var ledPin2 = "USR2";
var mydelay = 100;
var mydelay2 = 33;
var toggleState = b.LOW;
var toggleState2 = b.LOW;

console.log('Please connect ' + inputPin + ' to ' + outputPin +
    ' with a 1kohm resistor');
console.log('Please connect ' + inputPin2 + ' to ' + outputPin2 +
    ' with a 1kohm resistor');
b.pinMode(inputPin, b.INPUT);
b.pinMode(outputPin, b.OUTPUT);
b.pinMode(ledPin, b.OUTPUT);
b.pinMode(inputPin2, b.INPUT);
b.pinMode(outputPin2, b.OUTPUT);
b.pinMode(ledPin2, b.OUTPUT);
b.digitalWrite(outputPin, b.LOW);
b.digitalWrite(outputPin2, b.LOW);
b.attachInterrupt(inputPin, inputHandler, b.CHANGE);
b.attachInterrupt(inputPin2, inputHandler2, b.CHANGE);
toggle();
toggle2();

function inputHandler(x) {
    b.digitalWrite(ledPin, x.value);
}

function inputHandler2(x) {
    b.digitalWrite(ledPin2, x.value);
}

function toggle() {
    toggleState = (toggleState == b.LOW) ? b.HIGH : b.LOW;
    b.digitalWrite(outputPin, toggleState);
    setTimeout(toggle, mydelay);
}

function toggle2() {
    toggleState2 = (toggleState2 == b.LOW) ? b.HIGH : b.LOW;
    b.digitalWrite(outputPin2, toggleState2);
    setTimeout(toggle2, mydelay2);
}
