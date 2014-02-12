var b = require('bonescript');
var fs = require('fs');
var my = require('../src/my.js');

global.setup = function() {
    var capemgr = my.is_capemgr();
    var slots = fs.readFileSync(capemgr + '/slots', 'ascii');
    console.log(slots);
    var slot = slots.match(/^\s*\d+\s*:.*,bs.*P9_14/gm);
    console.log(slot);
    slot = slots.match(/\d+(?=\s*:.*,bs.*P9_14)/gm);
    console.log(slot);
    if(slot && slot[0]) {
        fs.writeFileSync(capemgr + '/slots', '-'+slot[0], 'ascii');
    }
    slots = fs.readFileSync(capemgr + '/slots', 'ascii');
    console.log(slots);

    deleteFile('/lib/firmware/bspwm_P9_14_e-00A0.dtbo');
    deleteFile('/lib/firmware/bspwm_P9_14_6-00A0.dtbo');
    
    function deleteFile(filename) {
        if(my.file_existsSync(filename)) {
            fs.unlinkSync(filename);
        }
    }
    
    b.analogWrite('P9_14', 0.9);
    
    console.log(JSON.stringify(b.getPinMode('USR3')));
    console.log(JSON.stringify(b.getPinMode('P9_12')));
    console.log(JSON.stringify(b.getPinMode('P9_13')));
    console.log(JSON.stringify(b.getPinMode('P9_14')));
    console.log(JSON.stringify(b.getPinMode('P9_35')));
    
    console.log(JSON.stringify(b.getPinMode('P9_15')));
    b.writeTextFile('/sys/class/gpio/unexport', ''+b.bone.pins.P9_15.gpio);
    console.log(JSON.stringify(b.getPinMode('P9_15')));
    b.pinMode('P9_15', b.OUTPUT);
    console.log(JSON.stringify(b.getPinMode('P9_15')));

    console.log('got here: ' + b.analogWrite('P9_14', 0.1));
};
