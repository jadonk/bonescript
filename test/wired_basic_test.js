var b = require('bonescript');

b.setDate(Date().toString(), doEcho);

function doEcho(x) {
    if(x.stdout != null) throw('setDate returned ' + JSON.stringify(x));
    b.echo('test', doGetPlatform);
}

function doGetPlatform(x) {
    if(x.data != 'test') throw('doEcho returned ' + JSON.stringify(x));
    b.getPlatform(onGetPlatform);
}

function onGetPlatform(x) {
    if(!x.name || !x.serialNumber || !x.version || (x.bonescript != '0.2.2'))
        throw('getPlatform returned ' + JSON.stringify(x));
    console.log('Name = ' + x.name);
    console.log('S/N = ' + x.serialNumber);
    console.log('Version = ' + x.version);
    console.log('BoneScript version = ' + x.bonescript);
    b.getPinMode('P9_20', onGetPinMode);
}

function onGetPinMode(x) {
    if(x.mux != 3) throw('getPinMode returned ' + JSON.stringify(x));
    b.pinMode('P9_24', b.INPUT, 7, 'disabled', 'fast', onPinModeInput);
}

function onPinModeInput(x) {
    if(x.value != true) throw('pinMode(input) returned ' + JSON.stringify(x));
    b.pinMode('P9_23', b.OUTPUT, 7, 'disabled', 'fast', onPinModeOutput);
}

function onPinModeOutput(x) {
    if(x.value != true) throw('pinMode(output) returned ' + JSON.stringify(x));
    b.digitalWrite('P9_23', b.LOW, onDigitalWriteLow);
}

function onDigitalWriteLow(x) {
    if(x.data != null) throw('digitalWrite(low) returned ' + JSON.stringify(x));
    b.digitalRead('P9_24', onDigitalReadLow);
}

function onDigitalReadLow(x) {
    if(x.value != b.LOW) throw('digitalRead(low) returned ' + JSON.stringify(x));
    b.digitalWrite('P9_23', b.HIGH, onDigitalWriteHigh);
}

function onDigitalWriteHigh(x) {
    if(x.data != null) throw('digitalWrite(high) returned ' + JSON.stringify(x));
    b.digitalRead('P9_24', onDigitalReadHigh);
}

function onDigitalReadHigh(x) {
    if(x.value != b.HIGH) throw('digitalRead(high) returned ' + JSON.stringify(x));
    b.analogWrite('P9_21', 0.25, 2000.0, onAnalogWrite);
}

function onAnalogWrite(x) {
    if(x.value != true) throw('analogWrite returned ' + JSON.stringify(x));
    setTimeout(doAnalogRead, 1000);
}

function doAnalogRead(x) {
    b.analogRead('P9_35', onAnalogRead);
}

function onAnalogRead(x) {
    if(x.value > 0.6 || x.value < 0.4)
        throw('analogRead returned ' + JSON.stringify(x));
    b.writeTextFile('/tmp/basic_test', 'So far so good', onWriteTextFile);
}

function onWriteTextFile(x) {
    if(x.err != null) throw('writeTextFile returned ' + JSON.stringify(x));
    b.readTextFile('/tmp/basic_test', onReadTextFile);
}

function onReadTextFile(x) {
    if(x.err != null) throw('readTextFile returned ' + JSON.stringify(x));
    if(x.data != 'So far so good')
        throw('onReadTextFile returned ' + JSON.stringify(x));
    complete();
}

function complete() {
    console.log('***PASS***');
    process.exit(0);
}

function printJSON(x) {
    console.log('x = ' + JSON.stringify(x));
}
