require('bonescript');

awValue = 0.01;
awDirection = 1;
fade = function() {
 analogWrite(bone.P8_13, awValue);
 awValue = awValue + (awDirection*0.01);
 if(awValue > 1.0) { awValue = 1.0; awDirection = -1; }
 else if(awValue <= 0.01) { awValue = 0.01; awDirection = 1; }
};

setup = function() { 
 pinMode(bone.P8_13, 'out', 4);
 setInterval(fade, 10);
};

