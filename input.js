require('bonescript');

outputPin = bone.P8_3;
inputPin = bone.P8_5;
outputPin2 = bone.P8_7;
inputPin2 = bone.P8_9;
ledPin = bone.USR3;
ledPin2 = bone.USR2;
mydelay = 100;
mydelay2 = 33;

setup = function() {
    console.log('Please connect ' + inputPin.key + ' to ' + outputPin.key +
        ' with a 1kohm resistor');
    console.log('Please connect ' + inputPin2.key + ' to ' + outputPin2.key +
        ' with a 1kohm resistor');
    pinMode(inputPin, INPUT);
    pinMode(outputPin, OUTPUT);
    digitalWrite(outputPin, LOW);
    pinMode(ledPin, OUTPUT);
    pinMode(inputPin2, INPUT);
    pinMode(outputPin2, OUTPUT);
    digitalWrite(outputPin2, LOW);
    pinMode(ledPin2, OUTPUT);
    attachInterrupt(inputPin, CHANGE, function(pin, value) {
        digitalWrite(ledPin, value);
    });
    attachInterrupt(inputPin2, CHANGE, function(pin, value) {
        digitalWrite(ledPin2, value);
    });
};

loop = [
    function() {
        digitalWrite(outputPin, HIGH);
        delay(mydelay);
        digitalWrite(outputPin, LOW);
        delay(mydelay);
    },
    function() {
        digitalWrite(outputPin2, HIGH);
        delay(mydelay2);
        digitalWrite(outputPin2, LOW);
        delay(mydelay2);
    }
];
