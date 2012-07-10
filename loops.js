require('bonescript');

ledPin = bone.USR3;
outputPin = bone.P8_3;

setup = function() {
    console.log("Running setup");
    pinMode(ledPin, OUTPUT);
    pinMode(outputPin, OUTPUT);
    digitalWrite(ledPin, LOW);
    digitalWrite(outputPin, LOW);
    console.log("getLoops() = " + JSON.stringify(getLoops()));

    // Start toggling after 5 seconds
    setTimeout(function() {
        console.log("Flashing LED for 5 seconds");
        loopid = addLoop(function() {
            digitalWrite(ledPin, HIGH);
            digitalWrite(outputPin, HIGH);
            delay(100);
            digitalWrite(ledPin, LOW);
            digitalWrite(outputPin, LOW);
        }, 150);
        console.log("loopid = " + loopid);
        console.log("getLoops() = " + JSON.stringify(getLoops()));

        // Stop toggling after 5 seconds
        setTimeout(function() {
            removeLoop(loopid)
            console.log("Halting flashing of LED");
        }, 5000);
    }, 5000);
};

run(setup);
