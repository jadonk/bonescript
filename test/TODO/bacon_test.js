/*
 * Setup
 */
var b = require("bonescript"); // Read BoneScript library

// Map used pins
var LED_RED = "P9_42";
var LED_BLUE = "P9_16";
var LED_GREEN = "P9_14";
var BUTTON = "P8_19";
var S_DATA  = "P9_18";
var S_CLOCK = "P9_22";
var S_LATCH = "P9_17";
var S_CLEAR = "P9_15";
var POT = 'P9_36';

// Define global variables
var state = false;
var segments = [ 0xC0, 0xF9, 0xA4, 0xB0, 0x99, 0x92, 0x82, 0xF8, 0x80, 0x90 ];
var port = '/dev/i2c-2';
var address = 0x1c;

// Configure pins
b.pinMode(LED_RED, b.OUTPUT);
b.pinMode(LED_BLUE, b.OUTPUT);
b.pinMode(BUTTON, b.INPUT);
b.pinMode(S_DATA,  b.OUTPUT);
b.pinMode(S_CLOCK, b.OUTPUT);
b.pinMode(S_LATCH, b.OUTPUT);
b.pinMode(S_CLEAR, b.OUTPUT);

// Initial pin states
b.digitalWrite(S_DATA,  b.LOW);
b.digitalWrite(S_CLOCK, b.LOW);
b.digitalWrite(S_LATCH, b.LOW);
b.digitalWrite(S_CLEAR, b.HIGH);

// Configure accelerometer
b.i2cOpen(port, address, {}, onI2C); // Open I2C port
b.i2cWriteBytes(port, 0x2a, [0x00]); // Set accelerometer in STANDBY mode
b.i2cWriteBytes(port, 0x0e, [0x00]); // Set accelerometer scale to 2G
b.i2cWriteBytes(port, 0x2a, [0x01]); // Set accelerometer in ACTIVE mode

/*
 * Add handlers
 */
blink(); // Call blink() to start it iterating
setInterval(readButton, 100); // Call readButton() every 100ms
setInterval(update7Seg, 100); // Call update7Seg() every 100ms
setInterval(readAccel, 200); // Call readAccel() every 200ms

/*
 * Define functions
 */
function blink() {
    state = !state;
    if(state) setTimeout(blink, 10); // Leave LED on for 10ms
    if(!state) setTimeout(blink, 990); // Leave LED off for 990ms
	b.digitalWrite(LED_RED, state ? b.HIGH : b.LOW);
}

function readButton() {
    // Read BUTTON status
    var status = b.digitalRead(BUTTON, onDigitalRead);
}

function onDigitalRead(x) {
    if(x.err) return;
    var status = x.value;
    
    // Set LED_BLUE to HIGH if BUTTON is LOW
    b.digitalWrite(LED_BLUE, status ? b.LOW : b.HIGH);
}

function update7Seg() {
    // Read the voltage from potentiometer
    b.analogRead(POT, onAnalogRead);
}

function onAnalogRead(x) {
    if(x.err) return;
    var value = x.value;

    // Convert floating point value 0-1 to digit 0-9
    var digit = parseInt(value*10, 10) % 10;
    
    // Shift out the character LED pattern
    b.shiftOut(S_DATA, S_CLOCK, b.MSBFIRST, segments[digit]);
    b.digitalWrite(S_LATCH, b.HIGH);
    b.digitalWrite(S_LATCH, b.LOW);
}

function onI2C() {
}

function readAccel() {
    b.i2cReadBytes(port, 1, 6, onReadBytes);
}

function onReadBytes(x) {
    if(x.event == 'callback') {
        var X = convertToG(x.res[0]); // First byte is X
        var brightness = Math.abs(X);
        if(brightness > 1) brightness = 1;
        b.analogWrite(LED_GREEN, brightness);
    }
}

function convertToG(x) {
    if(x >= 128) x = -((x^0xFF)+1); // Get two's complement
    x = x / 64; // Scale to G
    x = x.toFixed(2); // Limit decimal places
    return(x);
}


