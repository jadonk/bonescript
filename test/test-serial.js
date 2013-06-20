/*
var serialport = require('serialport');
var serialPort = new serialport.SerialPort("/dev/ttyO1", {
    baudrate: 115200
});

serialPort.on('open', onSerialPortOpen);
serialPort.on('data', onSerialPortData);

function onSerialPortOpen() {
    writeRepeatedly();
}

function writeRepeatedly() {
    serialPort.write('Open', onSerialWrite);
}

function onSerialWrite(err, results) {
    console.log('err = ' + err);
    console.log('results = ' + results);
    setTimeout(writeRepeatedly, 1000);
}

function onSerialPortData(data) {
    console.log('data = ' + data);
}
*/

var b = require('bonescript');
var port = '/dev/ttyO1';
var options = { baudrate: 115200 };

b.serialOpen(port, options, onSerial);

function onSerial(x) {
    if(x.err) throw('***FAIL*** ' + JSON.stringify(x));
    if(x.event == 'open') {
        writeRepeatedly();
    }
    if(x.event == 'data') {
        console.log('data = ' + x.data);
    }
}

function writeRepeatedly() {
    b.serialWrite(port, 'Open', onSerialWrite);
}

function onSerialWrite(x) {
    console.log('x = ' + JSON.stringify(x));
    setTimeout(writeRepeatedly, 1000);
}

