/*
 * Setup
 */
var b = require("bonescript"); // Read BoneScript library

// Map used pins
var S_DATA  = "P9_18";
var S_CLOCK = "P9_22";
var S_LATCH = "P9_17";
var S_CLEAR = "P9_15";

// Define global variables
var digit = 0;
var segments = [ 0xC0, 0xF9, 0xA4, 0xB0, 0x99, 0x92, 0x82, 0xF8, 0x80, 0x90 ];

// Configure pins
b.pinMode(S_DATA,  b.OUTPUT);
b.pinMode(S_CLOCK, b.OUTPUT);
b.pinMode(S_LATCH, b.OUTPUT);
b.pinMode(S_CLEAR, b.OUTPUT);

// Initial pin states
b.digitalWrite(S_DATA,  b.LOW);
b.digitalWrite(S_CLOCK, b.LOW);
b.digitalWrite(S_LATCH, b.LOW);
b.digitalWrite(S_CLEAR, b.HIGH);

/*
 * Add handlers
 */
// Call update7Seg() every 100ms
setInterval(update7Seg, 100);

/*
 * Define functions
 */
function update7Seg() {
    // Increment and wrap the digit (0-9)
    digit = (digit + 1) % 10;
    
    // Shift out the character LED pattern
    b.shiftOut(S_DATA, S_CLOCK, b.MSBFIRST, segments[digit]);
    b.digitalWrite(S_LATCH, b.HIGH);
    b.digitalWrite(S_LATCH, b.LOW);
}
