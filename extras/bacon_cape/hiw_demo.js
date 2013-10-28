var b = require("bonescript"); // Read BoneScript library
var child_process = require("child_process");

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

//
child_process.exec("python /home/root/blinky_slider.py");
blink();
update7Seg();
setInterval(readBUTTON, 100); // Call readBUTTON() every 100ms

/*
 * Define functions
 */
function blink() {
    state = !state;
    if(state) setTimeout(blink, 10); // Leave LED on for 10ms
    if(!state) setTimeout(blink, 990); // Leave LED off for 990ms
    b.digitalWrite(LED_RED, state ? b.HIGH : b.LOW);
}

function readBUTTON() {
    // Read BUTTON status
    var status = b.digitalRead(BUTTON);
    
    // Set LED_BLUE to HIGH if BUTTON is LOW
    b.digitalWrite(LED_BLUE, status ? b.LOW : b.HIGH);
}

function update7Seg() {
    // Read the voltage from potentiometer
    var value = 1-b.analogRead(POT);
    b.analogWrite(LED_GREEN, value);

    // Convert floating point value 0-1 to digit 0-9
    var digit = parseInt(value*10, 10) % 10;
    
    // Shift out the character LED pattern
    b.shiftOut(S_DATA, S_CLOCK, b.MSBFIRST, segments[digit], onShiftOut);
}

function onShiftOut() {
    b.digitalWrite(S_LATCH, b.HIGH, onLatchHigh);
}

function onLatchHigh() {
    b.digitalWrite(S_LATCH, b.LOW, onLatchLow);
}

function onLatchLow() {
    // Come back again in 100ms
    setTimeout(update7Seg, 100);
}
