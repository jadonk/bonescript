var b = require('bonescript');
var rxport = '/dev/ttyO1';
var txport = '/dev/ttyO4';
var options = { baudrate: 115200, parser: b.serialParsers.readline('\n') };
var teststring = "This is the string I'm sending out as a test";

b.serialOpen(rxport, options, onRxSerial);

function onRxSerial(x) {
    console.log('rx.event = ' + x.event);
    if(x.err) throw('***FAIL*** ' + JSON.stringify(x));
    if(x.event == 'open') {
        b.serialOpen(txport, options, onTxSerial);
    }
    if(x.event == 'data') {
        console.log('rx (' + x.data.length +
                    ') = ' + x.data.toString('ascii'));
    }
}

function onTxSerial(x) {
    console.log('tx.event = ' + x.event);
    if(x.err) throw('***FAIL*** ' + JSON.stringify(x));
    if(x.event == 'open') {
        writeRepeatedly();
    }
    if(x.event == 'data') {
        console.log('tx (' + x.data.length +
                    ') = ' + x.data.toString('ascii'));
    }
}

function printJSON(x) {
    console.log(JSON.stringify(x));
}

function writeRepeatedly() {
    b.serialWrite(txport, teststring, onSerialWrite);
}

function onSerialWrite(x) {
    if(x.err) console.log('onSerialWrite err = ' + x.err);
    if(x.event == 'callback') setTimeout(writeRepeatedly, 1000);
}

