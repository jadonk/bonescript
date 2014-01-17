//
// Demonstrate shiftOut with a 7 segment display
//

// read in the BoneScript library
var b = require('bonescript');

// define used pins
var sData  = "P9_18";
var sClock = "P9_22";
var sLatch = "P9_17";
var sClear = "P9_15";

// define other global variables
var digit = 0;
var segments = [ 0xC0, 0xF9, 0xA4, 0xB0, 0x99, 0x92, 0x82, 0xF8, 0x80, 0x90 ];

// configure pins as outputs
b.pinMode(sData,  b.OUTPUT);
b.pinMode(sClock, b.OUTPUT);
b.pinMode(sLatch, b.OUTPUT);
b.pinMode(sClear, b.OUTPUT);

// initial states
b.digitalWrite(sData,  b.LOW);
b.digitalWrite(sClock, b.LOW);
b.digitalWrite(sLatch, b.LOW);
b.digitalWrite(sClear, b.HIGH);

// call function to start updating the LED shift register
doUpdate();

// function to update the LED shift register
function doUpdate() {
    // shift out the character LED pattern
    b.shiftOut(sData, sClock, b.MSBFIRST, segments[digit], doLatch);

    // update the digit for next time
    digit = (digit + 1) % 10;
}

function doLatch() {
    // latch in the value
    b.digitalWrite(sLatch, b.HIGH, doLatchLow);
}

function doLatchLow() {
    b.digitalWrite(sLatch, b.LOW, scheduleUpdate);
}

function scheduleUpdate() {
    // update again in another 25ms
    setTimeout(doUpdate, 25);
}
