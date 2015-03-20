Digital
=======

A Digital signal has a value of True or False. 
A True value corresponds to a Logic 1 or a High voltage(3.3v). 
A False value corresponds to a Logic 0 or a Low voltage(0v).
OctalBoneScript(OBS) represents these two states as HIGH and LOW.

## digitalWrite(pin, value, callback)
- pin is the identifier of a pin on the P9 or P8 header ex: P8_10
- value is the digital value to be written to pin. Valid values are either '0' or '1'. You can also pass b.HIGH or b.LOW
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
```

## digitalWriteSync(pin, value)
- pin is the identifier of a pin on the P9 or P8 header ex: P8_10
- value is the digital value to be written to pin. Valid values are either '0' or '1'. You can also pass b.HIGH or b.LOW

**Example**
```javascript

var b = require('octalbonescript'); //load the library

var pin = 'P8_10'; //the pin to operate on

// below code will assign digital output mode to pin and when the pin is ready, 
// it will put it in HIGH state synchronously
b.pinModeSync(pin, b.OUTPUT);
b.digitalWriteSync(pin, b.HIGH);
```

## digitalRead(pin, callback[err|null, value])
- pin is the identifier of a pin on the P9 or P8 header ex: P8_10
- callback function provides value of digital pin as second argument

**Example**
```javascript
var pin = 'P8_10'; //the pin to operate on

// below code will assign digital output mode to pin and when the pin is ready, it will put it in HIGH state.
b.pinMode(pin, b.INPUT, function(err1) {
  if (err1) {
    console.error(err1.message); //output any error
    return;
  }
  b.digitalRead(pin, function(err2, value) {
      if (err2) {
        console.error(err2.message); //output any error
        return;
      }
      console.log(value); // here value is either '0' or '1'
  });
});

```
