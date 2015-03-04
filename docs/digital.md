Digital
=======

A Digital signal has a value of True or False. 
A True value corresponds to a Logic 1 or a High voltage(3.3v). 
A False value corresponds to a Logic 0 or a Low voltage(0v).
Octal Bone Script(OBS) represents these two states as HIGH and LOW.

The Beagle Bone Black's GPIO pins can be configured as INPUTS and OUTPUTS. The default is INPUT. 
One can use pinMode function provided by OBS to change the configuration of the GPIO pin.

## pinMode(pin, value, callback(error|null))
- pin is the identifier of a pin on the P9 or P8 header ex: P8_10
- value is the new state of the pin. Valid input HIGH or LOW
- callback is the function to call when the operation completes. When the operation completes successfully the parameter will be null, otherwise the error will be passed. 

**Example**
```javascript

var b = require('octalbonescript'); //load the library

var pin = 'P8_10'; //the pin to operate on

b.pinMode(pin, b.OUTPUT, function(err) {
  if (err) 
    console.log(x); //output any error
});
```

## digitalWrite(pin, mode, callback)
- pin is the identifier of a pin on the P9 or P8 header ex: P8_10
- mode is the new mode of the pin. Valid input INPUT or OUTPUT
- callback is the function to call when the operation completes. When the operation completes successfully the parameter will be null, otherwise the error will be passed. 

**Example**
```javascript

var b = require('octalbonescript'); //load the library

var pin = 'P8_10'; //the pin to operate on

b.pinMode(pin, b.OUTPUT, function(err1) {
  if (err1) {
    console.log(err1); //output any error
    return;
  }
  b.digitalWrite(pin, b.HIGH, function(err2) {
      if (err2) {
        console.log(err2); //output any error
        return;
      }
  });
});

  
