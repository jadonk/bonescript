// Task #3 - Use potentiometer to control green LED brightness

/*
 * Setup
 */
var b = require("bonescript"); // Read BoneScript library

// Map used pins
var LED_GREEN = "P9_14";
var POT = "P9_36";

/*
 * Add handlers
 */
setInterval(readPOT, 100); // Call readPOT() every 100ms

/*
 * Define functions
 */
function readPOT() {
    var value = b.analogRead(POT); // Read the voltage from potentiometer
    b.analogWrite(LED_GREEN, value); // Set green LED brightness to value
}
