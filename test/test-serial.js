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

