Interrupts
==========

Interrupts are used to used to identify RISING, FALLING or CHANGING edge of signal on ANY pin of BeagleBone. 
These functions provide functionality to detect interrupt and handling them.

## attachInterrupt(pin, mode, handler[err, resp], callback[err|null])
- pin is the identifier of a pin on the P9 or P8 header ex: P8_10
- mode can take values RISING, FALLING or CHANGE
- handler is function which is called when interrupt occurs. First argument is 'verror' object in case of error or null otherwise. Resp argument is object with two properties, pin and value.
- callback is function which is called when execution of attachInterrupt is complete. First argument can be 'verror' object or null.

**Example**

```javascript
var b = require('octalbonescript'); //load the library

var pin = 'P8_10'; //the pin to operate on

// below code will assign digital output mode to pin and when the pin is ready, it will put it in HIGH state.
b.attachInterrupt(pin, b.RISING, function(err, resp) {
  if(err){
    console.error(err.message);
    return;
  }
  console.log(resp.pin);
  console.log(resp.value);
}, function(err){
  if(err){
    console.error(err.message);
    return;
  }
});
```

## detachInterrupt(pin, callback[err|null])
- pin is the identifier of a pin on the P9 or P8 header ex: P8_10
- callback is function which is called when execution of attachInterrupt is complete. First argument can be 'verror' object or null.

**Example**

```javascript
var b = require('octalbonescript'); //load the library

var pin = 'P8_10'; //the pin to operate on

// below code will assign digital output mode to pin and when the pin is ready, it will put it in HIGH state.
b.detachInterrupt(pin, , function(err){
  if(err){
    console.error(err.message);
    return;
  }
});
```
