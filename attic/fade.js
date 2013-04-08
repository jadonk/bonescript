var b = require('bonescript');

// setup starting conditions
var awValue = 0.01;
var awDirection = 1;
var awPin = "P8_13";
var awMux = 4;

// configure pin 
b.pinMode(awPin, 'out', awMux);

// call function to update brightness every 10ms
setInterval(fade, 10);

// function to update brightness
function fade() {
 b.analogWrite(awPin, awValue);
 awValue = awValue + (awDirection*0.01);
 if(awValue > 1.0) { awValue = 1.0; awDirection = -1; }
 else if(awValue <= 0.01) { awValue = 0.01; awDirection = 1; }
}
