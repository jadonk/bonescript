/*
 * Setup
 */
var b = require("bonescript"); // Read BoneScript library

// Map used pins

// Define global variables
var port = '/dev/i2c-2';
var address = 0x1c;

// Configure pins and initial state
b.i2cOpen(port, address, {}, onI2C); // Open I2C port
b.i2cWriteBytes(port, 0x2a, [0x00]); // Set accelerometer in STANDBY mode
b.i2cWriteBytes(port, 0x0e, [0x00]); // Set accelerometer scale to 2G
b.i2cWriteBytes(port, 0x2a, [0x01]); // Set accelerometer in ACTIVE mode

/*
 * Add handlers
 */
// Call readAccel() every 200ms
setInterval(readAccel, 200);

/*
 * Define functions
 */
function onI2C() {
}

function readAccel() {
    b.i2cReadBytes(port, 1, 6, onReadBytes);
}

function onReadBytes(x) {
    if(x.event == 'callback') {
        var X = convertToG(x.res[0]); // First byte is X
        var Y = convertToG(x.res[2]); // Third byte is Y
        var Z = convertToG(x.res[4]); // Fifth byte is Z
        console.log('X: ' + X + '  Y: ' + Y + '  Z: ' + Z);
    }
}

function convertToG(x) {
    if(x >= 128) x = -((x^0xFF)+1); // Get two's complement
    x = x / 64; // Scale to G
    x = x.toFixed(2); // Limit decimal places
    return(x);
}
