// Functions derived from https://github.com/joyent/node/blob/master/lib/buffer.js are:
//
// Copyright Joyent, Inc. and other Node contributors. All rights reserved.
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to
// deal in the Software without restriction, including without limitation the
// rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
// sell copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
// 
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
// 
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
// FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
// IN THE SOFTWARE.

var fs = require('fs');
var buffer = require('buffer');
var util = require('util');
bone = require('./bone').bone;

var debug = false;

// Function derived from https://github.com/joyent/node/blob/master/lib/buffer.js
if(!buffer.Buffer.prototype.readUint16BE) {
    buffer.Buffer.prototype.readUint16BE = function(offset) {
        var val = 0;
        val = this[offset] << 8;
        val |= this[offset + 1];
        return(val);
    };
}

// Function derived from https://github.com/joyent/node/blob/master/lib/buffer.js
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

// Function derived from https://github.com/joyent/node/blob/master/lib/buffer.js
if(!buffer.Buffer.prototype.writeUint16BE) {
    buffer.Buffer.prototype.writeUint16BE = function(value, offset) {
        this[offset] = (value & 0xff00) >>> 8;
        this[offset + 1] = value & 0x00ff;
    };
}

// Function derived from https://github.com/joyent/node/blob/master/lib/buffer.js
// fill(value, start=0, end=buffer.length)
if(!buffer.Buffer.prototype.fill) {
    buffer.Buffer.prototype.fill = function (value, start, end) {
        value || (value = 0);
        start || (start = 0);
        end || (end = this.length);

        for(var i=start; i<end; i++) {
            this[i] = value;
        }
    };
}

// Function derived from https://github.com/joyent/node/blob/master/lib/buffer.js
if(!buffer.Buffer.prototype.hexWrite) {
    buffer.Buffer.prototype.hexWrite = function(string, offset, length) {
        offset = +offset || 0;
        var remaining = this.length - offset;
        if(!length) {
            length = remaining;
        } else {
            length = +length;
            if (length > remaining) {
                length = remaining;
            }
        }

        // must be an even number of digits
        var strLen = string.length;
        if(strLen % 2) {
            throw new Error('Invalid hex string');
        }
        if(length > strLen / 2) {
            length = strLen / 2;
        }

        for(var i=0; i<length; i++) {
            var byte = parseInt(string.substr(i * 2, 2), 16);
            if (isNaN(byte)) throw new Error('Invalid hex string');
            this[offset + i] = byte;
        }
        return i;
    };
}

var eepromData = new buffer.Buffer(244);

var readEeproms = function(files) {
    var data = {};
    for(var file in files) {
        var raw = fetchEepromData(file);
        var parsed = null;
        if(raw) {
            if(files[file].type == 'bone') {
                parsed = parseMainEeprom(raw);
                if(parsed) parsed.type = 'bone';
            } else {
                parsed = parseCapeEeprom(raw);
                if(parsed) parsed.type = 'cape';
            }
            if(parsed) {
                data[file] = parsed;
            }
        }
    }
    return(data);
};

var fetchEepromData = function(address) {
    try {
        console.warn('Reading EEPROM at '+address);
        var eepromFile =
            fs.openSync(
                address,
                'r'
            );
        fs.readSync(eepromFile, eepromData, 0, 244, 0);
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
    data.boardName = x.toString('ascii', 4, 12).trim().replace(/^\x00+|\x00+$/g, '');
    data.version = x.toString('ascii', 12, 16).trim().replace(/^\x00+|\x00+$/g, '');
    data.serialNumber = x.toString('ascii', 16, 28).trim().replace(/^\x00+|\x00+$/g, '');
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
    data.boardName = x.toString('ascii', 6, 38).trim().replace(/^\x00+|\x00+$/g, '');
    data.version = x.toString('ascii', 38, 42).trim().replace(/^\x00+|\x00+$/g, '');
    data.manufacturer = x.toString('ascii', 42, 58).trim().replace(/^\x00+|\x00+$/g, '');
    data.partNumber = x.toString('ascii', 58, 74).trim().replace(/^\x00+|\x00+$/g, '');
    data.numPins = x.readUint16BE(74);
    data.serialNumber = x.toString('ascii', 76, 88).trim().replace(/^\x00+|\x00+$/g, '');
    data.currentVDD_3V3EXP = x.readUint16BE(236);
    data.currentVDD_5V = x.readUint16BE(238);
    data.currentSYS_5V = x.readUint16BE(240);
    data.DCSupplied = x.readUint16BE(242);
    data.mux = {};
    for(pin in bone) {
        if(bone[pin].eeprom) {
            var pinOffset = bone[pin].eeprom * 2 + 88;
            var pinData = x.readUint16BE(pinOffset);
            var pinObject = {};
            var used = (pinData & 0x8000) >> 15;
            if(used || debug) {
                pinObject.used = used ? 'used' : 'available';
                if(debug) pinObject.data = x.hexSlice(pinOffset, pinOffset+2);
                var direction = (pinData & 0x6000) >> 13;
                switch(direction) {
                case 1:
                    pinObject.direction = 'in';
                    break;
                case 2:
                    pinObject.direction = 'out';
                    break;
                case 3:
                    pinObject.direction = 'bidir';
                    break;
                case 0:
                default:
                    console.error('Unknown direction value: '+direction);
                }
                pinObject.slew = (pinData & 0x40) ? 'slow' : 'fast';
                pinObject.rx = (pinData & 0x20) ? 'enabled' : 'disabled';
                var pullup = (pinData & 0x18) >> 3;
                switch(pullup) {
                case 1:
                    pinObject.pullup = 'disabled';
                    break;
                case 2:
                    pinObject.pullup = 'pullup';
                    break;
                case 0:
                    pinObject.pullup = 'pulldown';
                    break;
                case 3:
                default:
                    console.error('Unknown pullup value: '+pullup);
                }
                pinObject.mode = (pinData & 0x0007);
                try {
                    // read mux from debugfs
                    var muxReadout= fs.readFileSync('/sys/kernel/debug/omap_mux/'+bone[pin].mux, 'ascii');
                    pinObject.function = muxReadout.split("\n")[2].split("|")[pinObject.mode].replace('signals:', '').trim();
                } catch(ex) {
                    console.warn('Unable to read pin mux function name: '+bone[pin].mux);
                }
                data.mux[pin] = pinObject;
            }
        }
    }
    return(data);
};

var fillCapeEepromData = function(data) {
    eepromData.fill();
    eepromData.hexWrite('aa5533ee', 0, 4);
    eepromData.write('A0', 4, encoding='ascii');
    if(data.boardName.length > 32) {
        data.boardName.length = 32;
    }
    eepromData.write(data.boardName, 6, encoding='ascii');
    if(data.version.length > 4) {
        data.version.length = 4;
    }
    eepromData.write(data.version, 38, encoding='ascii');
    if(data.manufacturer.length > 16) {
        data.manufacturer.length = 16;
    }
    eepromData.write(data.manufacturer, 42, encoding='ascii');
    if(data.partNumber.length > 16) {
        data.partNumber.length = 16;
    }
    eepromData.write(data.partNumber, 58, encoding='ascii');
    eepromData.writeUint16BE(data.numPins, 74, 'ascii');
    if(data.serialNumber.length > 12) {
        data.serialNumber.length = 12;
    }
    eepromData.write(data.serialNumber, 76, encoding='ascii');
    eepromData.writeUint16BE(data.currentVDD_3V3EXP, 236);
    eepromData.writeUint16BE(data.currentVDD_5V, 238);
    eepromData.writeUint16BE(data.currentSYS_5V, 240);
    eepromData.writeUint16BE(data.DCSupplied, 242);
    for(pin in data.mux) {
        if(bone[pin].eeprom) {
            var pinOffset = bone[pin].eeprom * 2 + 88;
            var pinObject = data.mux[pin];
            var pinData = 0;
            if(pinObject.used == 'used') pinData |= 0x8000;
            switch(pinObject.direction) {
            case 'in':
                pinData |= 0x2000;
                break;
            case 'out':
                pinData |= 0x4000;
                break;
            case 'bidir':
                pinData |= 0x6000;
                break;
            default:
                console.error('Unknown direction value: '+pinObject.direction);
                pinData |= 0x2000;
            }
            if(pinObject.slew == 'slow') pinData |= 0x40;
            if(pinObject.rx == 'enabled') pinData |= 0x20;
            var pullup = (pinData & 0x18) >> 3;
            switch(pinObject.pullup) {
            case 'disabled':
                pinData |= 0x08;
                break;
            case 'pullup':
                pinData |= 0x10;
                break;
            case 'pulldown':
                break;
            default:
                console.error('Unknown pullup value: '+pullup);
            }
            pinData |= (pinObject.mode & 0x0007);
            eepromData.writeUint16BE(pinData, pinOffset);
        }
    }
    return(eepromData);
};

var defaultEepromFiles = {
    '/sys/bus/i2c/drivers/at24/1-0050/eeprom': { type: 'bone' },
    '/sys/bus/i2c/drivers/at24/1-0051/eeprom': { type: 'bone' },
    '/sys/bus/i2c/drivers/at24/3-0054/eeprom': { type: 'cape' },
    '/sys/bus/i2c/drivers/at24/3-0055/eeprom': { type: 'cape' },
    '/sys/bus/i2c/drivers/at24/3-0056/eeprom': { type: 'cape' },
    '/sys/bus/i2c/drivers/at24/3-0057/eeprom': { type: 'cape' },
    'test-bone.eeprom': { type: 'bone' },
    'test-cape.eeprom': { type: 'cape' },
};

//   test process:
//     $ node eeprom.js
//     $ node eeprom.js -w test-eeproms.json
//     $ echo "a18bf9b65d676cd0a6e07b13fa06a362  test-cape.eeprom" | md5sum -c
//     $ node eeprom.js -rmy-eeproms.json cape:test-cape.eeprom
//     $ node eeprom.js -r cape:test-cape.eeprom verify-eeproms.json
//     $ diff my-eeproms.json verify-eeproms.json
//     $ node eeprom.js -wmy-eeproms.json test-cape.eeprom verify-cape.eeprom
//     $ echo "a18bf9b65d676cd0a6e07b13fa06a362  verify-cape.eeprom" | md5sum -c
var printUsage = function() {
   var usageString =
       'Print usage:\n' +
       '\n' +
       '  node bonescript/eeprom.js -h\n' +
       '\n' +
       '\n' +
       'Read eeproms and write the output to a JSON-compatible file:\n' +
       '\n' +
       '  node bonescript/eeprom.js [-r [type:source.eeprom ...] destination.json] \n' +
       '\n' +
       '    type               : the word "bone" or "cape"\n' +
       '    source.eeprom      : source eeprom file\n' +
       '\n' +
       '\n' +
       'Read JSON eeproms file and write the output to eeprom(s):\n' +
       '\n' +
       '  node bonescript/eeprom.js -w source.json [[source-eeprom] destination.eeprom]\n' +
       '\n' +
       '    source.json        : source JSON file containing one or more eeprom structures\n' +
       '    destination.eeprom : where to write the output,\n' +
       '                         must either match eeprom structure name or\n' +
       '                         provide a source-eeprom parameter\n' +
       '    source-eeprom      : which eeprom structure to use as source\n';
   console.error(usageString);
};

// Only run this section when run as a stand-alone application
if(!module.parent) {
    var eeproms = {};
    var destinationJSON = '';
    process.argv.shift();
    process.argv.shift();
    if((process.argv.length > 0) && (process.argv[0].match(/^-w/i))) {
        // Write EEPROMs
        var sourceJSON = process.argv.shift().substr(2);
        var sourceEeprom = '';
        var destinationEeprom = '';
        if(sourceJSON == '') {
            sourceJSON = process.argv.shift();
        }
        if(process.argv.length > 2) {
            printUsage();
            throw('Too many arguments');
        } else if(process.argv.length > 0) {
            sourceEeprom = destinationEeprom = process.argv.pop();
            if(process.argv.length > 0) {
                sourceEeprom = process.argv.pop();
            }
        }
        try {
            console.warn('Reading '+sourceJSON);
            var jsonFile = fs.readFileSync(sourceJSON, 'ascii');
            console.warn('Parsing '+sourceJSON);
            if(debug) console.warn(jsonFile);
            eeproms = JSON.parse(jsonFile);
        } catch(ex) {
            throw('Unable to parse '+sourceJSON+': '+ex);
        }
        // If source file isn't nested, make it
        if(eeproms.type) {
            if(destinationEeprom == '') {
                printUsage();
                throw('Destination must be specified if not part of the JSON file');
            }
            eeproms[destinationEeprom] = eeproms;
        }
        for(x in eeproms) {
            if((sourceEeprom == '') || (x == sourceEeprom)) {
                console.warn('Writing eeprom '+x);
                if(eeproms[x].type != 'cape') {
                    throw('Only type "cape" is currently handled');
                }
                fillCapeEepromData(eeproms[x]);
                if(debug) console.log(util.inspect(eepromData, true, null));
                if(destinationEeprom == '') {
                    fs.writeFileSync(x, eepromData);
                } else {
                    console.warn('Writing to file '+destinationEeprom);
                    fs.writeFileSync(destinationEeprom, eepromData);
                }
            } else {
                console.warn('Skipping eeprom '+x);
            }
        }
    } else if(process.argv.length == 0 ||
              ((process.argv.length > 0) && (process.argv[0].match(/^-r/i)))) {
        // Read EEPROMs
        var destinationJSON = '';
        var eepromsToRead = defaultEepromFiles;
        if(process.argv.length > 0) {
            destinationJSON = process.argv.shift().substr(2);
            if(destinationJSON == '') {
                destinationJSON = process.argv.pop();
            }
        }
        if(process.argv.length > 0) {
            eepromsToRead = {};
            while(process.argv.length > 0) {
                var eepromFile = process.argv.shift().split(':');
                if(eepromFile.length != 2) {
                    printUsage();
                    throw('Source eeproms must be of the format <type>:<file>');
                }
                eepromsToRead[eepromFile[1]] = { type: eepromFile[2] };
            }
        }
        var eeproms = readEeproms(eepromsToRead);
        if(eeproms == {}) {
            console.warn('No valid EEPROM contents found');
        } else {
            var eepromsString = JSON.stringify(eeproms, null, 2);
            if(destinationJSON == '') {
                console.log(eepromsString);
            } else {
                console.warn('Writing JSON file to '+destinationJSON);
                fs.writeFileSync(destinationJSON, eepromsString);
            }
        }
    } else {
        printUsage();
        return(0);
    }
}
