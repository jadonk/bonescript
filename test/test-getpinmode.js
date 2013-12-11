var b = require('bonescript');

b.analogWrite('P9_14', 0.1);

console.log(JSON.stringify(b.getPinMode('USR3')));
console.log(JSON.stringify(b.getPinMode('P9_12')));
console.log(JSON.stringify(b.getPinMode('P9_13')));
console.log(JSON.stringify(b.getPinMode('P9_14')));
console.log(JSON.stringify(b.getPinMode('P9_35')));

console.log(JSON.stringify(b.getPinMode('P9_15')));
b.writeTextFile('/sys/class/gpio/unexport', ''+b.bone.pins['P9_15'].gpio);
console.log(JSON.stringify(b.getPinMode('P9_15')));
b.pinMode('P9_15', b.OUTPUT);
console.log(JSON.stringify(b.getPinMode('P9_15')));
