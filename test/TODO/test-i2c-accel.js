var b = require('bonescript');
var port = '/dev/i2c-2'
var address = 0x1c;
var data = [0xAA, 0x55, 0x33, 0xEE, 65, 51, 51, 53, 66, 78, 76, 84];
var GSCALE = 2;

b.i2cOpen(port, address, {}, onI2C);
b.i2cScan(port, onScan);
b.i2cWriteBytes(port, 0x2a, [1], onWriteBytes);

function onI2C(x) {
    if(x.event == 'data') {
        console.log('data = ' + JSON.stringify(x.data));
    }
}

function onScan(x) {
    console.log('scan = ' + JSON.stringify(arguments));
}

function onWriteBytes(x) {
    console.log('writeBytes = ' + JSON.stringify(arguments));
    //if(x.event == 'callback') b.i2cWriteByte(port, 0, onWriteByte);
    if(x.event == 'callback') b.i2cReadBytes(port, 1, 6, onReadBytes);
}

function onWriteByte(x) {
    console.log('writeByte = ' + JSON.stringify(arguments));
    if(x.event == 'callback') b.i2cReadBytes(port, null, 13, onReadBytes);
}

function onReadBytes(x) {
    console.log('readBytes = ' + JSON.stringify(arguments));
    //if(x.event == 'callback') process.exit(0);
}
