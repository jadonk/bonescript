// Import functions for interacting with hardware
var b = require('bonescript');

var ledPin = "P8_13";
var ledPin2 = "USR0";

// Turn off USR1, USR2 and USR3
b.pinMode("USR1", b.OUTPUT);
b.digitalWrite("USR1", b.LOW);
b.pinMode("USR2", b.OUTPUT);
b.digitalWrite("USR2", b.LOW);
b.pinMode("USR3", b.OUTPUT);
b.digitalWrite("USR3", b.LOW);

// Initialize pins as outputs
b.pinMode(ledPin, b.OUTPUT);
b.pinMode(ledPin2, b.OUTPUT);

// Assume LEDs are off at the start
var state = b.LOW;

// Call function to toggle LEDs every 100ms
setInterval(toggleLEDs, 100);

// Define function to change the state of the LEDs
function toggleLEDs() {
    if(state == b.HIGH) state = b.LOW;
    else state = b.HIGH;
    b.digitalWrite(ledPin, state);
    b.digitalWrite(ledPin2, state);
};
