var b = require('bonescript');

b.analogWrite('P9_14', 0.2);
b.pinMode('P9_14', b.OUTPUT);
b.digitalWrite('P9_14', false);
b.digitalWrite('P9_14', true);

b.pinMode('P9_15', b.OUTPUT);
console.log(JSON.stringify(b.getPinMode('P9_15')));
b.digitalWrite('P9_15', false);
console.log(JSON.stringify(b.getPinMode('P9_15')));
b.digitalWrite('P9_15', true);
console.log(JSON.stringify(b.getPinMode('P9_15')));
