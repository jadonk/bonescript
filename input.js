require('bonescript');

outputPin = bone.P8_3;
inputPin = bone.P8_5;
ledPin = bone.USR3;
mydelay = 100;

setup = function() {
    console.log('Please connect ' + inputPin.key + ' to ' + outputPin.key +
        ' with a 1kohm resistor');
    pinMode(inputPin, INPUT);
    pinMode(outputPin, OUTPUT);
    digitalWrite(outputPin, LOW);
    pinMode(ledPin, OUTPUT);
    attachInterrupt(inputPin, function(x) {
        digitalWrite(ledPin, x.value);
    }, CHANGE);
};

loop = function() {
    digitalWrite(outputPin, HIGH);
    delay(mydelay);
    digitalWrite(outputPin, LOW);
    delay(mydelay);
};
