var b = require('bonescript');

b.getPlatform(onGetPlatform);

function onGetPlatform(x) {
    if(!x.name || !x.serialNumber || !x.version)
        err('getPlatform returned ' + JSON.stringify(x));
    console.log('Name = ' + x.name);
    console.log('S/N = ' + x.serialNumber);
    console.log('Version = ' + x.version);
    console.log('BoneScript version = ' + x.bonescript);
    if(x.bonescript != '0.2.2')
        err('BoneScript 0.2.2 required');
    b.setDate(Date().toString(), onSetDate);
}

function onSetDate(x) {
    if(x.stdout !== null) {
        err('setDate returned ' + JSON.stringify(x));
    }
    b.echo('test', onEcho);
}

function onEcho(x) {
    if(x.data != 'test') err('doEcho returned ' + JSON.stringify(x));
    b.getPinMode('P9_20', onGetPinMode);
}

function onGetPinMode(x) {
    if(x.mux != 3) err('getPinMode returned ' + JSON.stringify(x));
    b.pinMode('P9_24', b.INPUT, 7, 'disabled', 'fast', onPinModeInput);
}

function onPinModeInput(x) {
    if(x.value !== true) err('pinMode(input) returned ' + JSON.stringify(x));
    b.pinMode('P9_23', b.OUTPUT, 7, 'disabled', 'fast', onPinModeOutput);
}

function onPinModeOutput(x) {
    if(x.value !== true) err('pinMode(output) returned ' + JSON.stringify(x));
    b.digitalWrite('P9_23', b.LOW, onDigitalWriteLow);
}

function onDigitalWriteLow(x) {
    if(x.data !== null) err('digitalWrite(low) returned ' + JSON.stringify(x));
    b.digitalRead('P9_24', onDigitalReadLow);
}

function onDigitalReadLow(x) {
    if(x.value != b.LOW) err('digitalRead(low) returned ' + JSON.stringify(x));
    b.digitalWrite('P9_23', b.HIGH, onDigitalWriteHigh);
}

function onDigitalWriteHigh(x) {
    if(x.data !== null) err('digitalWrite(high) returned ' + JSON.stringify(x));
    b.digitalRead('P9_24', onDigitalReadHigh);
}

function onDigitalReadHigh(x) {
    if(x.value != b.HIGH) err('digitalRead(high) returned ' + JSON.stringify(x));
    b.analogWrite('P9_21', 0.27, 2000.0, onAnalogWrite);
}

function onAnalogWrite(x) {
    if(x.value !== true) err('analogWrite returned ' + JSON.stringify(x));
    setTimeout(doAnalogRead, 1000);
}

function doAnalogRead() {
    b.analogRead('P9_35', onAnalogRead);
}

function onAnalogRead(x) {
    if(x.value > 0.55 || x.value < 0.45)
        err('analogRead returned ' + JSON.stringify(x));
    b.writeTextFile('/tmp/basic_test', 'So far so good', onWriteTextFile);
}

function onWriteTextFile(x) {
    if(x.err !== null) err('writeTextFile returned ' + JSON.stringify(x));
    b.readTextFile('/tmp/basic_test', onReadTextFile);
}

function onReadTextFile(x) {
    if(x.err !== null) err('readTextFile returned ' + JSON.stringify(x));
    if(x.data != 'So far so good')
        err('onReadTextFile returned ' + JSON.stringify(x));
    complete();
}

function complete() {
    console.log('***PASS***');
    process.exit(0);
}

function err(x) {
    console.log('***FAIL*** ' + x);
    throw(x);
}

function printJSON(x) {
    console.log('x = ' + JSON.stringify(x));
}
