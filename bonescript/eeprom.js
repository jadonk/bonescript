var fs = require('fs');
var buffer = require('buffer');
var util = require('util');
bone = require('./bone').bone;

// Function inspired by https://github.com/joyent/node/blob/master/lib/buffer.js
if(!buffer.Buffer.prototype.readUint16BE) {
    buffer.Buffer.prototype.readUint16BE = function(offset) {
        var val = 0;
        val = this[offset] << 8;
        val |= this[offset + 1];
        return(val);
    };
}

// Function inspired by https://github.com/joyent/node/blob/master/lib/buffer.js
if(!buffer.Buffer.prototype.hexSlice) {
    var toHex = function(n) {
        if (n < 16) return '0' + n.toString(16);
        return n.toString(16);
    }
    buffer.Buffer.prototype.hexSlice = function(start, end) {
        var len = this.length;
        if (!start || start < 0) start = 0;
        if (!end || end < 0 || end > len) end = len;

        var out = '';
        for (var i = start; i < end; i++) {
            out += toHex(this[i]);
        }
        return(out);
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
    data.header = x.hexSlice(0, 4);
    if(data.header != 'aa5533ee') {
        console.error('Unknown EEPROM format: '+data.header);
        return(null);
    }
    data.boardName = x.toString('ascii', 4, 12).trim();
    data.version = x.toString('ascii', 12, 16).trim();
    data.serialNumber = x.toString('ascii', 16, 28).trim();
    data.configOption = x.hexSlice(28, 60);
    return(data);
};

var parseCapeEeprom = function(x) {
    var data = {};
    data.header = x.hexSlice(0, 4);
    if(data.header != 'aa5533ee') {
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
    data.currentVDD_3V3EXP = x.readUint16BE(236);
    data.currentVDD_5V = x.readUint16BE(238);
    data.currentSYS_5V = x.readUint16BE(240);
    data.DCSupplied = x.readUint16BE(242);
    data.eeprom = {};
    for(pin in bone) {
        if(bone[pin].eeprom) {
            var pinOffset = bone[pin].eeprom;
            var pinData = x.readUint16BE(pinOffset);
            var pinObject = {};
            pinObject.used = (pinData & 0x8000) >> 15;
            if(pinData) {
                pinObject.direction = ((pinData & 0x4000) >> 14) ? 'in' : 'out';
                pinObject.pullup = (pinData & 0x3000) >> 12;
                pinObject.mode = (pinData & 0x0007);
                pinObject.data = x.hexSlice(pinOffset, pinOffset+2);
                data.eeprom[bone[pin].name] = pinObject;
            }
        }
    }
    return(data);
};

console.log(util.inspect(readEeproms(), true, null));
