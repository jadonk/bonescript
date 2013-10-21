/*
 * Setup
 */
var b = require("bonescript"); // Read BoneScript library

// Map used pins
var LED_RED = "P9_42";

// Define global variables
var state = false;

// Configure pins
b.pinMode(LED_RED, b.OUTPUT);

/*
 * Add handlers
 */
// Call blink() every 1000ms
setInterval(blink, 1000);

/*
 * Define functions
 */
function blink() {
	state = !state;
	b.digitalWrite(LED_RED, state ? b.HIGH : b.LOW);
}

