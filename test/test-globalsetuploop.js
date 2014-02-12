var b = require('bonescript');
var x = 0;

global.setup = function() {
    b.pinMode('P9_14', b.ANALOG_OUTPUT);
};

global.loop = function() {
    //console.log(x);
    b.analogWrite('P9_14', x);
    x += 0.001;
    if(x >= 1.0) x = 0;
};

