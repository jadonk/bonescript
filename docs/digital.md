Digital
=======

A Digital signal has a value of True or False. 
A True value corresponds to a Logic 1 or a High voltage(3.3v). 
A False value corresponds to a Logic 0 or a Low voltage(0v).
OctalBoneScript(OBS) represents these two states as HIGH and LOW.

The Beagle Bone Black's GPIO pins can be configured as INPUTS and OUTPUTS. The default depends on pin and you should call pinMode to ensure the pin has right mode for your needs. 
One can use pinMode function provided by OBS to change the configuration of the ANY pin.

## pinMode(pin, mode, callback(error|null, givenPin))
- pin is the identifier of a pin on the P9 or P8 header ex: P8_10
- mode is the new mode of the pin. Valid input INPUT, OUTPUT, INPUT_PULLUP, INPUT_PULDOWN and ANALOG_OUTPUT
- callback is the function to call when the operation completes. When the operation completes successfully the parameter will be null, otherwise the error will be passed. Callback second argument is same as pin number given in first argumemnt of pinMode. It is there just in case you have not used a variable in first argument.
- For entire OBS, errors are always object of [verror](https://www.npmjs.com/package/verror).

**Example**
```javascript

var b = require('octalbonescript'); //load the library

var pin = 'P8_10'; //the pin to operate on

// below code will assign digital output mode to P8_10
b.pinMode(pin, b.OUTPUT, function(err, pin) {
  if (err) 
    console.error(err.message); //output any error
  // you may use your pin now...
});
```

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

  
