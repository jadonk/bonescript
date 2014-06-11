var b = require('bonescript');

b.getPlatform(onGetPlatform);

function onGetPlatform(x) {
    if(!x.name || !x.serialNumber || !x.version)
        err('getPlatform returned ' + JSON.stringify(x));
    console.log('Name = ' + x.name);
    console.log('S/N = ' + x.serialNumber);
    console.log('Version = ' + x.version);
    console.log('BoneScript version = ' + x.bonescript);
    b.setDate(Date().toString(), onSetDate);
}

function onSetDate(x) {
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
