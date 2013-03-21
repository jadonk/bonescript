// Import functions for interacting with hardware
var b = require('bonescript');

var ledPin = "P8_3";
var ledPin2 = "USR3";

// Initialize pins as outputs
b.pinMode(ledPin, b.OUTPUT);
b.pinMode(ledPin2, b.OUTPUT);

// Call function to toggle LEDs every 100ms
setTimeout(toggleLEDs, 100);

// Assume LEDs are off by default
var state = b.LOW;

// Define function to change the state of the LEDs
function toggleLEDs() {
    if(state == b.HIGH) state = b.LOW;
    else state = b.HIGH;
    b.digitalWrite(ledPin, state);
    b.digitalWrite(ledPin2, state);
};
