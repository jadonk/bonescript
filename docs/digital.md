Digital
=======

A Digital signal has a value of True or False. 
A True value corresponds to a Logic 1 or a High voltage(3.3v). 
A False value corresponds to a Logic 0 or a Low voltage(0v).
OctalBoneScript(OBS) represents these two states as HIGH and LOW.

## digitalWrite(pin, mode, callback)
- pin is the identifier of a pin on the P9 or P8 header ex: P8_10
- mode is the new mode of the pin. Valid input INPUT, OUTPUT, INPUT_PULLUP, INPUT_PULDOWN
- callback is the function to call when the operation completes. When the operation completes successfully the parameter will be null, otherwise the error will be passed. 

**Example**
```javascript

var b = require('octalbonescript'); //load the library

var pin = 'P8_10'; //the pin to operate on

// below code will assign digital output mode to pin and when the pin is ready, it will put it in HIGH state.
b.pinMode(pin, b.OUTPUT, function(err1) {
  if (err1) {
    console.error(err1.message); //output any error
    return;
  }
  b.digitalWrite(pin, b.HIGH, function(err2) {
      if (err2) {
        console.error(err2.message); //output any error
        return;
      }
  });
});

  
