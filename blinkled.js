require('bonescript');

ledPin = bone.P8_3;
ledPin2 = bone.USR3;

setup = function() {
    pinMode(ledPin, OUTPUT);
    pinMode(ledPin2, OUTPUT);
};

loop = function() {
    digitalWrite(ledPin, HIGH);
    digitalWrite(ledPin2, HIGH);
    delay(1000);
    digitalWrite(ledPin, LOW);
    digitalWrite(ledPin2, LOW);
    delay(1000);
};
