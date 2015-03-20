Analog
======

Analog output is essentially PWM signal. It has a duty and freq. Duty can take any values including and betweeen 0 and 1.
Frequency is in Hertz and BeagleBone supports any frequency upto 1 MHz.

There are also dedicated pins on BeagleBone which is attached to ADC and can work as analog input pins. 
Those pins are 'P9_33' to 'P9_40'.

## analogWrite(pin, value, freq, callback[err|null])
- pin is the identifier of a pin on the P9 or P8 header ex: P8_13. Only SOME pins can work as PWM pins. Please refer BeagleBone pin diagram to identify those pins
- value is any floating point value including and between 0 and 1. It is essentially duty cycle of PWM signal.
- freq is the frequency of PWM signal. If you dont provide this value, it defaults to 2000 Hz.
- callback function first argument is 'verror' object in case of error or null otherwise.

**Example**
```javascript
var b = require('octalbonescript'); //load the library

var pin = 'P8_13'; //the pin to operate on

// below code will assign analog output mode to pin and when the pin is ready, it will write 0.5 value.
b.pinMode(pin, b.ANALOG_OUTPUT, function(err1) {
  if (err1) {
    console.error(err1.message); //output any error
    return;
  }
  b.analogWrite(pin, 0.5, 2000, function(err2) {
      if (err2) {
        console.error(err2.message); //output any error
        return;
      }
  });
});
```

## analogRead(pin, callback[err|null, value])
- pin is the pin identifier. Only P9_33 to P9_40 can work as analog input pins
- callback first argument is 'verror' object in case of error, null otherwise. Second argument is the value of analog input given as floting point number including and between 0 and 1. 0V corresponds to 0 and 1.8V corresponds to 1.

**Example**
```javascript
// no pinmode is required for analogRead as those pins are dedicated.
var b = require('octalbonescript'); //load the library

var pin = 'P9_33'; //the pin to operate on
b.analogRead(pin, function(err, value){
  if(err){
    console.error(err.message);
    return;
  }
  console.log(value); // value is floating point number between 0 and 1.
});
```

## startAnalog(pin, callback[err|null])
- pin is any PWM pin identifier in P8 or P9
- callback will have first argument as 'verror' object if there is error starting PWM. Null otherwise

This function is automatically called when you perform ```analogWrite``` but this is provided in case you manually stop analog output.

**Example**
```javascript
var b = require('octalbonescript'); //load the library

var pin = 'P9_13'; //the pin to operate on
b.startAnalog(pin, function(err){
  if(err){
    console.error(err.message);
  }
});
```

## stopAnalog(pin, callback[err|null])
- pin is any PWM pin identifier in P8 or P9
- callback will have first argument as 'verror' object if there is error starting PWM. Null otherwise

This function stops analog output on given pin. You can call ```startAnalog``` to start it again.

**Example**
```javascript
var b = require('octalbonescript'); //load the library

var pin = 'P9_13'; //the pin to operate on
b.stopAnalog(pin, function(err){
  if(err){
    console.error(err.message);
  }
});
```
