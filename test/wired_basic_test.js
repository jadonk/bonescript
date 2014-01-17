var b = require('bonescript');
var serial = {
    in: {
        port: '/dev/ttyO1',
        options: { baudrate: 115200 }
    },
    out: {
        port: '/dev/ttyO4',
        options: { baudrate: 115200 },
    }
};

var pinDW = 'P9_12';
var pinDR = 'P9_14';
var pinGM = 'P9_20';
var pinAW = 'P9_21';
var pinAR = 'P9_35';
//var pinST = 'P9_13';
//var pinSR = 'P9_26';

var supported = {
    '0.2.2': true,
    '0.2.3': true,
    '0.2.4': true
};
var version;

var timeout = setTimeout(onTimeout, 10000);

console.log('Testing getPlatform');
b.getPlatform(onGetPlatform);

function onGetPlatform(x) {
    if(!x.name || !x.serialNumber || !x.version)
        err('getPlatform returned ' + JSON.stringify(x));
    console.log('Name = ' + x.name);
    console.log('S/N = ' + x.serialNumber);
    console.log('Version = ' + x.version);
    console.log('BoneScript version = ' + x.bonescript);
    if(typeof supported[x.bonescript] === undefined || !supported[x.bonescript])
        err('BoneScript needs to be 0.2.2 or newer');
    version = x.bonescript;
    console.log('Testing setDate');
    b.setDate(Date().toString(), onSetDate);
}

function onSetDate(x) {
    // Different distros have different success results running 'date'
    if(false && x.stdout !== null) {
        err('setDate returned ' + JSON.stringify(x));
    }
    console.log('Testing echo');
    b.echo('test', onEcho);
}

function onEcho(x) {
    if(x.data != 'test') err('doEcho returned ' + JSON.stringify(x));
    console.log('Testing getPinMode');
    b.getPinMode(pinGM, onGetPinMode);
}

function onGetPinMode(x) {
    if(x.mux != 3) err('getPinMode returned ' + JSON.stringify(x));
    console.log('Testing pinMode(input,GPIO)');
    b.pinMode(pinDR, b.INPUT, 7, 'disabled', 'fast', onPinModeInput);
}

function onPinModeInput(x) {
    if(x.value !== true) err('pinMode(input) returned ' + JSON.stringify(x));
    console.log('Testing pinMode(output,GPIO)');
    b.pinMode(pinDW, b.OUTPUT, 7, 'disabled', 'fast', onPinModeOutput);
}

function onPinModeOutput(x) {
    if(x.value !== true) err('pinMode(output) returned ' + JSON.stringify(x));
    console.log('Testing digitalWrite(low)');
    b.digitalWrite(pinDW, b.LOW, onDigitalWriteLow);
}

function onDigitalWriteLow(x) {
    if(x.data !== null) err('digitalWrite(low) returned ' + JSON.stringify(x));
    console.log('Testing digitalRead(low)');
    b.digitalRead(pinDR, onDigitalReadLow);
}

function onDigitalReadLow(x) {
    if(x.value != b.LOW) err('digitalRead(low) returned ' + JSON.stringify(x));
    console.log('Testing digitalWrite(high)');
    b.digitalWrite(pinDW, b.HIGH, onDigitalWriteHigh);
}

function onDigitalWriteHigh(x) {
    if(x.data !== null) err('digitalWrite(high) returned ' + JSON.stringify(x));
    console.log('Testing digitalRead(high)');
    b.digitalRead(pinDR, onDigitalReadHigh);
}

function onDigitalReadHigh(x) {
    if(x.value != b.HIGH) err('digitalRead(high) returned ' + JSON.stringify(x));
    console.log('Testing analogWrite');
    b.analogWrite(pinAW, 0.27, 2000.0, onAnalogWrite);
}

function onAnalogWrite(x) {
    if(x.value !== true) err('analogWrite returned ' + JSON.stringify(x));
    console.log('Testing analogRead');
    setTimeout(doAnalogRead, 1000);
}

function doAnalogRead() {
    b.analogRead(pinAR, onAnalogRead);
}

function onAnalogRead(x) {
    if(x.value > 0.55 || x.value < 0.45)
        err('analogRead returned ' + JSON.stringify(x));
    console.log('Testing writeTextFile');
    b.writeTextFile('/tmp/basic_test', 'So far so good', onWriteTextFile);
}

function onWriteTextFile(x) {
    if(x.err !== null) err('writeTextFile returned ' + JSON.stringify(x));
    console.log('Testing readTextFile');
    b.readTextFile('/tmp/basic_test', onReadTextFile);
}

function onReadTextFile(x) {
    if(x.err !== null) err('readTextFile returned ' + JSON.stringify(x));
    if(x.data != 'So far so good')
        err('readTextFile returned ' + JSON.stringify(x));
    if(version != '0.2.2') doSerial();
    else complete();
}

function doSerial() {
    console.log('Testing serialOpen(in)');
    b.serialOpen(serial.in.port, serial.in.options, onSerialInOpen);
}

function onSerialInOpen(x) {
    if(x.err) err('serialOpen(in) returned' + JSON.stringify(x));
    if(x.event == 'open') {
        console.log('Testing serialOpen(out)');
        b.serialOpen(serial.out.port, serial.out.options, onSerialOutOpen);
    }
    if(x.event == 'data') {
        onSerialInData(x);
    }
}

function onSerialOutOpen(x) {
    if(x.err) err('serialOpen(out) returned' + JSON.stringify(x));
    if(x.event == 'open') {
        doSerialWrite();
    }
    if(x.event == 'data') {
        err('Unexpected data on serial output port: ' + JSON.stringify(x));
    }
}

function doSerialWrite() {
    console.log('Testing serialWrite');
    serial.size = 2000;
    serial.data = new Buffer(serial.size);
    for(var i = 0; i < serial.size; i++) {
        serial.data.writeUInt8(i%255, i);
    }
    serial.offset = 0;
    b.serialWrite(serial.out.port, serial.data, onSerialWrite);
}

function onSerialWrite(x) {
    if(x.err) err('serialWrite returned' + JSON.stringify(x));
}

function onSerialInData(x) {
    if(x.data.length < 1) 
        err('invalid serial data ' + JSON.stringify(x));
    console.log('Recieved ' + x.data.length + ' bytes');
    for(var i = 0; i < x.data.length; i++) {
        if(x.data.readUInt8(i) != serial.data[serial.offset])
            err('invalid serial data ' + JSON.stringify(x));
        serial.offset++;
    }
    if(serial.offset >= serial.size) complete();
}

function complete() {
    clearTimeout(timeout);
    console.log('***PASS***');
    process.exit(0);
}

function err(x) {
    clearTimeout(timeout);
    console.log('***FAIL*** ' + x);
    throw(x);
}

function onTimeout() {
    err('Timeout');
}

function printJSON(x) {
    console.log('x = ' + JSON.stringify(x));
}
