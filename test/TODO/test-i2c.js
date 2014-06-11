var b = require('bonescript');
var port = '/dev/i2c-0';
var address = 0x50;
//var data = [0xAA, 0x55, 0x33, 0xEE, 65, 51, 51, 53, 66, 78, 76, 84];
// Where is the first byte going?!?

b.i2cOpen(port, address, {}, onI2C);
b.i2cScan(port, onScan);
b.i2cWriteByte(port, 0, onWriteByte);
b.i2cReadBytes(port, null, 12, onReadBytes);

function onI2C(x) {
    if(x.event == 'data') {
        console.log('data = ' + JSON.stringify(x.data));
    }
}

function onScan(err, data) {
    console.log('scan = ' + JSON.stringify(arguments));
}

function onWriteByte(err) {
    console.log('writeByte = ' + JSON.stringify(err));
}

function onReadBytes(err, res) {
    console.log('readBytes = ' + JSON.stringify(arguments));
    if(err.event == 'callback') process.exit(0);
}
