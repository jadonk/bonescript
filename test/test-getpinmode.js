var b = require('bonescript');

b.analogWrite('P9_14', 0.1);

console.log(JSON.stringify(b.getPinMode('P9_12')));
console.log(JSON.stringify(b.getPinMode('P9_13')));
console.log(JSON.stringify(b.getPinMode('P9_14')));
console.log(JSON.stringify(b.getPinMode('P9_15')));
console.log(JSON.stringify(b.getPinMode('P9_35')));
