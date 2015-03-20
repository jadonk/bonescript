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
