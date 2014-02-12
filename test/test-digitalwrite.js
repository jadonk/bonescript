var b = require('bonescript');

b.pinMode('P9_16', b.ANALOG_OUTPUT);

global.setup = function() {
    b.analogWrite('P9_14', 0.2);
    b.pinMode('P9_14', b.OUTPUT);
    b.digitalWrite('P9_14', false);
    b.digitalWrite('P9_14', true);
    
    console.log(JSON.stringify(b.getPinMode('P9_16')));
    b.pinMode('P9_16', b.OUTPUT);
    console.log(JSON.stringify(b.getPinMode('P9_16')));
    b.digitalWrite('P9_16', false);
    console.log(JSON.stringify(b.getPinMode('P9_16')));
    b.digitalWrite('P9_16', true);
    console.log(JSON.stringify(b.getPinMode('P9_16')));
};
