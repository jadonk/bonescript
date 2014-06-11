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
   winston.error(usageString);
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
        if(sourceJSON === '') {
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
            winston.info('Reading '+sourceJSON);
            var jsonFile = fs.readFileSync(sourceJSON, 'ascii');
            winston.info('Parsing '+sourceJSON);
            if(debug) winston.info(jsonFile);
            eeproms = JSON.parse(jsonFile);
        } catch(ex) {
            throw('Unable to parse '+sourceJSON+': '+ex);
        }
        // If source file isn't nested, make it
        if(eeproms.type) {
            if(destinationEeprom === '') {
                printUsage();
                throw('Destination must be specified if not part of the JSON file');
            }
            eeproms[destinationEeprom] = eeproms;
        }
        for(var x in eeproms) {
            if((sourceEeprom === '') || (x == sourceEeprom)) {
                winston.info('Writing eeprom '+x);
                if(eeproms[x].type != 'cape') {
                    throw('Only type "cape" is currently handled');
                }
                fillCapeEepromData(eeproms[x]);
                if(debug) winston.debug(util.inspect(eepromData, true, null));
                if(destinationEeprom === '') {
                    fs.writeFileSync(x, eepromData);
                } else {
                    winston.info('Writing to file '+destinationEeprom);
                    fs.writeFileSync(destinationEeprom, eepromData);
                }
            } else {
                winston.info('Skipping eeprom '+x);
            }
        }
    } else if(process.argv.length === 0 ||
              ((process.argv.length > 0) && (process.argv[0].match(/^-r/i)))) {
        // Read EEPROMs
        var eepromsToRead = defaultEepromFiles;
        if(process.argv.length > 0) {
            destinationJSON = process.argv.shift().substr(2);
            if(destinationJSON === '') {
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
        eeproms = readEeproms(eepromsToRead);
        if(eeproms == {}) {
            winston.info('No valid EEPROM contents found');
        } else {
            var eepromsString = JSON.stringify(eeproms, null, 2);
            if(destinationJSON === '') {
                console.log(eepromsString);
            } else {
                winston.info('Writing JSON file to '+destinationJSON);
                fs.writeFileSync(destinationJSON, eepromsString);
            }
        }
    } else {
        printUsage();
        return(0);
    }
}
