// This script needs a complete rewrite itself!!!

var b = require('bonescript');

for(var pin in b.bone.pins) {
    var mode = b.getPinMode(b.bone.pins[pin]);
    //console.log('getPinMode(' + bone[pin].key + ') = ' + JSON.stringify(mode));
    b.bone.pins[pin].options = mode.options;
}

console.log("if(typeof exports === 'undefined') exports = {};");
console.log("");
console.log("exports.bone = " + JSON.stringify(b.bone.pins,null,4) + ";");
