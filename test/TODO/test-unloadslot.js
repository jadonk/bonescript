var fs = require('fs');
var my = require('../src/my.js');
var capemgr = my.is_capemgr();
var slots = fs.readFileSync(capemgr + '/slots', 'ascii');
console.log(slots);
var slot = slots.match(/^\s*\d+\s*:.*,bs.*P8_13/gm);
console.log(slot);
slot = slots.match(/\d+(?=\s*:.*,bs.*P8_13)/gm);
console.log(slot);
