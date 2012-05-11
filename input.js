var bb = require('./bonescript');

var outputPin = bone.P8_3;
var inputPin = bone.P8_5;

var timeEvent = 0;
var nextState = LOW;
var toggleGPIO = function() {
    console.log('Setting ' + outputPin.key + 
        ((nextState == HIGH) ? ' HIGH' : ' LOW'));
    timeEvent++;
    console.time(''+timeEvent);
    digitalWrite(outputPin, nextState);
    nextState = (nextState == HIGH) ? LOW : HIGH;
};
var handler = function(pin, value) {
    console.log(pin.key + ' changed to ' + ((value == HIGH) ? 'HIGH' : 'LOW'));
    console.timeEnd(''+timeEvent);
};

setup = function() {
    console.log('Please connect ' + inputPin.key + ' to ' + outputPin.key +
        ' with a 1kohm resistor');
    pinMode(inputPin, INPUT);
    pinMode(outputPin, OUTPUT);
    attachInterrupt(inputPin, handler, CHANGE);
    setInterval(toggleGPIO, 500);
};

loop = function() {
};

bb.run();