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
        console.log(pin.key + ' changed to ' + 
            ((value == HIGH) ? 'HIGH' : 'LOW'));
    });
};

loop = [
    function() {
        //console.log("Setting " + outputPin.key + " HIGH");
        digitalWrite(ledPin, HIGH);
        digitalWrite(outputPin, HIGH);
        delay(500);
        digitalWrite(ledPin, LOW);
        digitalWrite(outputPin, LOW);
        delay(500);
    },
    function() {
        //console.log("Reading " + ainPin.key);
        var value = analogRead(ainPin);
        analogWrite(pwmPin, value);
        delay(100);
    }
];

run(setup, loop);
