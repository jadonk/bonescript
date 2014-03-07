// Task #2 - Use button to set blue LED

/*
 * Setup
 */
var b = require("bonescript"); // Read BoneScript library

// Map used pins
var LED_BLUE = "P9_16";
var BUTTON = "P8_19";

// Configure pins
b.pinMode(LED_BLUE, b.OUTPUT);
b.pinMode(BUTTON, b.INPUT);

/*
 * Add handlers
 */
setInterval(readBUTTON, 100); // Call readBUTTON() every 100ms

/*
 * Define functions
 */
function readBUTTON() {
    // Read BUTTON status
    var status = b.digitalRead(BUTTON);
    
    // Set LED_BLUE to HIGH if BUTTON is LOW
    b.digitalWrite(LED_BLUE, status ? b.LOW : b.HIGH);
}
