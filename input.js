require('bonescript');

outputPin = bone.P8_3;
inputPin = bone.P8_5;
outputPin2 = bone.P8_7;
inputPin2 = bone.P8_9;
mydelay = 300;
mydelay2 = 500;

setup = function() {
    console.log('Please connect ' + inputPin.key + ' to ' + outputPin.key +
        ' with a 1kohm resistor');
    console.log('Please connect ' + inputPin2.key + ' to ' + outputPin2.key +
        ' with a 1kohm resistor');
    pinMode(inputPin, INPUT);
    pinMode(outputPin, OUTPUT);
    digitalWrite(outputPin, LOW);
    pinMode(inputPin2, INPUT);
    pinMode(outputPin2, OUTPUT);
    digitalWrite(outputPin2, LOW);
    attachInterrupt(inputPin, CHANGE, function(pin, value) {
        console.log(pin.key + ' changed to ' + ((value == HIGH) ? 'HIGH' : 'LOW'));
    });
    attachInterrupt(inputPin2, CHANGE, function(pin, value) {
        console.log(pin.key + ' changed to ' + ((value == HIGH) ? 'HIGH' : 'LOW'));
    });
};

loop = [
    function() {
        digitalWrite(outputPin, HIGH);
        delay(mydelay);
        digitalWrite(outputPin, LOW);
        delay(mydelay);
        //mydelay *= 0.9;
    },
    function() {
        digitalWrite(outputPin2, HIGH);
        delay(mydelay2);
        digitalWrite(outputPin2, LOW);
        delay(mydelay2);
        //mydelay2 *= 0.9;
    }
];

run(setup, loop);
