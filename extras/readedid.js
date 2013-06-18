var b = require('bonescript');
var fs = require('fs');
var Edid = require('./edid');
fs.readFile('/sys/class/drm/card0/card0-HDMI-A-1/edid', printStatus);
function printStatus(err, data) {
//b.readTextFile('/sys/class/drm/card0/card0-HDMI-A-1/edid', printStatus);
//function printStatus(x) {
//    var data = string2Bin(x.data);
    for(var i = 0; i < data.length && i < 100; i++) {
        //console.log(i + ': ' + data.charCodeAt(i));
        console.log(i + ': ' + data[i]);
    }
    var edid = new Edid();
    edid.setEdidData(data);
    edid.parse();
    console.log('valid = ' + edid.validHeader);
    console.log('eisaId = ' + edid.eisaId);
    console.log('productCode = ' + edid.productCode);
    console.log('serialNumber = ' + edid.serialNumber);
    console.log('manufactureDate = ' + edid.manufactureDate);
    console.log('edidVersion = ' + edid.edidVersion);
    console.log('bdp = ' + JSON.stringify(edid.bdp));
    console.log('chromaticity = ' + JSON.stringify(edid.chromaticity));
    console.log('exts = ' + JSON.stringify(edid.exts)); 
}

