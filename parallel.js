require('bonescript');

ledPin = bone.USR3;
outputPin = bone.P8_3;
eventPin = bone.P8_5;
ainPin = bone.P9_39;
pwmPin = bone.P9_14;

setup = function() {
    console.log('Please connect ' + outputPin.key + ' to ' + eventPin.key +
        ' with a 1kohm resistor');
    pinMode(ledPin, OUTPUT);
    pinMode(outputPin, OUTPUT);
    pinMode(pwmPin, OUTPUT);
    pinMode(eventPin, INPUT);
    digitalWrite(outputPin, LOW);
    attachInterrupt(eventPin, CHANGE, function(pin, value) {
        digitalWrite(ledPin, value);
    });
};

loop = [
    function() {
        digitalWrite(outputPin, HIGH);
        delay(250);
        digitalWrite(outputPin, LOW);
        delay(250);
    },
    function() {
        var value = analogRead(ainPin);
        analogWrite(pwmPin, value);
        delay(50);
    }
];
