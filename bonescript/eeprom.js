var fs = require('fs');
var buffer = require('buffer');
var util = require('util');

if(!buffer.Buffer.prototype.readUint16BE) {
    buffer.Buffer.prototype.readUint16BE = function(offset) {
        var val = 0;
        val = buffer[offset] << 8;
        val |= buffer[offset + 1];
        return val;
    };
}

var eepromData = new buffer.Buffer(256);

var readEeproms = function() {
    var data = {};
    var addresses = [
        '/sys/bus/i2c/drivers/at24/3-0054/eeprom',
        '/sys/bus/i2c/drivers/at24/3-0055/eeprom',
        '/sys/bus/i2c/drivers/at24/3-0056/eeprom',
        '/sys/bus/i2c/drivers/at24/3-0057/eeprom',
        'eeprom-dump'
    ];
    var cape = null;
    var main = null;
    var raw = fetchEepromData('/sys/bus/i2c/drivers/at24/1-0050/eeprom');
    if(raw) {
        main = parseMainEeprom(raw);
    }
    if(main) {
        data.main = main;
    }
    for(var address in addresses) {
        raw = fetchEepromData(addresses[address]);
        if(raw) {
            cape = parseCapeEeprom(raw);
            if(cape) {
                data[addresses[address]] = cape;
            }
        }
    }
    return(data);
};

var fetchEepromData = function(address) {
    try {
        console.log('Reading EEPROM at '+address);
        var eepromFile =
            fs.openSync(
                address,
                'r'
            );
        fs.readSync(eepromFile, eepromData, 0, 256, 0);
        return(eepromData);
    } catch(ex) {
        console.warn('Unable to open EEPROM at '+address+': '+ex);
        return(null);
    }
};

var parseMainEeprom = function(x) {
    var data = {};
    data.header = x.toString('base64', 0, 4);
    if(data.header != 'qlUz7g==') {
        console.error('Unknown EEPROM format: '+data.header);
        return(null);
    }
    data.boardName = x.toString('ascii', 4, 12).trim();
    data.version = x.toString('ascii', 12, 16).trim();
    data.serialNumber = x.toString('ascii', 16, 28).trim();
    data.configOption = x.toString('base64', 28, 60);
    return(data);
};

var parseCapeEeprom = function(x) {
    var data = {};
    data.header = x.toString('base64', 0, 4);
    if(data.header != 'qlUz7g==') {
        console.error('Unknown EEPROM format: '+data.header);
        return(null);
    }
    data.formatRev = x.toString('ascii', 4, 6);
    if(data.formatRev != 'A0') {
        console.error('Unknown EEPROM format revision: '+data.formatRev);
        return(null);
    }
    data.boardName = x.toString('ascii', 6, 38).trim();
    data.version = x.toString('ascii', 38, 42).trim();
    data.manufacturer = x.toString('ascii', 42, 58).trim();
    data.partNumber = x.toString('ascii', 58, 74).trim();
    data.numPins = x.readUint16BE(74);
    data.serialNumber = x.toString('ascii', 76, 88).trim();
    data.currentVDD_3V3EXP = x.readUint16BE(228);
    data.currentVDD_5V = x.readUint16BE(230);
    data.currentSYS_5V = x.readUint16BE(232);
    data.DCSupplied = x.readUint16BE(234);
    return(data);
};

console.log(readEeproms());
