var bb = require('bonescript');

var ledPin = bone.p8_3;

setup = function()
{
 pinMode(ledPin, OUTPUT);
};

loop = function()
{
 digitalWrite(ledPin, HIGH);
 delay(1000);
 digitalWrite(ledPin, LOW);
 delay(1000);
};

bb.run();