var bb = require('./bonescript');

var outputPin = bone.P8_3;
var inputPin = bone.P8_5;

var handler = function(pin, value) {
    console.log(pin.key + ' changed to ' + ((value == HIGH) ? 'HIGH' : 'LOW'));
};

setup = function() {
    console.log('inputPin mode: ' + JSON.stringify(getPinMode(inputPin)));
    console.log('outputPin mode: ' + JSON.stringify(getPinMode(outputPin)));
    pinMode(inputPin, INPUT);
    pinMode(outputPin, OUTPUT);
    console.log('inputPin mode: ' + JSON.stringify(getPinMode(inputPin)));
    console.log('outputPin mode: ' + JSON.stringify(getPinMode(outputPin)));
    attachInterrupt(inputPin, handler, CHANGE);
};

var nextState = LOW;
var toggleGPIO = function() {
    console.log('Setting ' + outputPin.key + 
        ((nextState == HIGH) ? ' HIGH' : ' LOW'));
    digitalWrite(outputPin, nextState);
    nextState = (nextState == HIGH) ? LOW : HIGH;
};

setInterval(toggleGPIO, 1000);

loop = function() {
};

bb.run();