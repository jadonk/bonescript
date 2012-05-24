var bb = require('bonescript');

var outputPin = bone.P8_3;
var inputPin = bone.P8_5;

var timeEvent = 0;
var nextState = HIGH;
var toggleGPIO = function() {
    timeEvent++;
    console.time(''+timeEvent);
    digitalWrite(outputPin, nextState);
    nextState = (nextState == HIGH) ? LOW : HIGH;
};
var handler = function(pin, value) {
    console.timeEnd(''+timeEvent);
    console.log(pin.key + ' changed to ' + ((value == HIGH) ? 'HIGH' : 'LOW'));
};
var startToggle = function() {
    // The loop() function would block the running of the event handler.
    // setInterval() is a way to get a function to run at an interval that
    // does not block while it is waiting.  The challenge is you must provide
    // a function that can be called, rather than just continue where you 
    // left off.  This can add some complexity for beginners, but it has some
    // benefits for writing embedded software.
    setInterval(toggleGPIO, 500);
};

setup = function() {
    console.log('Please connect ' + inputPin.key + ' to ' + outputPin.key +
        ' with a 1kohm resistor');
    pinMode(inputPin, INPUT);
    pinMode(outputPin, OUTPUT);
    digitalWrite(outputPin, LOW);
    attachInterrupt(inputPin, CHANGE, handler);
    setTimeout(startToggle, 500);  // give some time for the handler to spawn
};

bb.run();
