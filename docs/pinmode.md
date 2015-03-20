pinMode
=======

Assigns a mode to given pin. This function can assign any functionality to a pin and need for additional cape is eliminated. 
v1.0.0 supports INPUT, OUTPUT, INPUT_PULLUP, INPUT_PULDOWN and ANALOG_OUTPUT modes. More modes like PRU will be introduced in 
v1.1.0. If you want to use pin as Serial or I2C, please check Serial and I2C section of documentation.

## pinMode(pin, mode, callback(error|null, givenPin))
- pin is the identifier of a pin on the P9 or P8 header ex: P8_10
- mode is the new mode of the pin. Valid input INPUT, OUTPUT, INPUT_PULLUP, INPUT_PULDOWN and ANALOG_OUTPUT
- callback is the function to call when the operation completes. When the operation completes successfully the parameter will be null, otherwise the error will be passed. Callback second argument is same as pin number given in first argumemnt of pinMode. It is there just in case you have not used a variable in first argument.
- For entire OBS, errors are always object of [verror](https://www.npmjs.com/package/verror).
- this function is async so callback is recommended to know completion. You can use pinModeSync to perform pinMode in sync.

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

## pinModeSync(pin, mode)
- Introduced in v1.0 of OBS.
- pin is the identifier of a pin on the P9 or P8 header ex: P8_10
- mode is the new mode of the pin. Valid input INPUT, OUTPUT, INPUT_PULLUP, INPUT_PULDOWN and ANALOG_OUTPUT

**Example**
```javascript

var b = require('octalbonescript'); //load the library

var pin = 'P8_10'; //the pin to operate on

// below code will assign digital output mode to P8_10
var resp = b.pinModeSync(pin, b.OUTPUT);
// if resp is 'true' then it successfully executed. Otherwise the resp will be 'false'
```
