var b = require('bonescript');

var inputPin = "P9_36";

loop();

function loop() {
    var value = b.analogRead(inputPin);
    console.log(value);
    setTimeout(loop, 1);
}
