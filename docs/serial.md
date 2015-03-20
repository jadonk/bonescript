Serial Port
===========

BeagleBone has in-built serial port functionality and OctalBoneScript provides a way to access it without loading any aditional cape.
These functions are essentially wrapper around [serialport](https://github.com/voodootikigod/node-serialport) library.

We recommned that you use these functions instead of the library because these functions automatically performs required
pinMode on the pins to make them ready for serial communication.

**Please note that original bonescript functions like ```serialOpen``` are deprecated and you must use
```serial.open``` like functions documented below.**

## serial.open(path, options, handler[data], callback[err|null, serialPort])
- path is the BeagleBone path of serial port. Valid values are ```/dev/ttyO1```, ```/dev/ttyO2```, ```/dev/ttyO4```, ```/dev/ttyO5```
- check https://github.com/voodootikigod/node-serialport#methods for options
- handler funciton is called when data is received on serial port. First argument contains data received.
- callback function is called upon completion of serial port open. If there is error, first argument is verror object otherwise it is null
- callback function second argument is same as the object you get after calling ``` new SerialPort``` as per this example: https://github.com/voodootikigod/node-serialport#to-use

**Example**
```javascript

var b = require('octalbonescript'); //load the library

b.serial.open('/dev/tty01', {}, function(data){
  console.log(data);
}, function(err){
  if(err){
    console.error(err.message);
  }
});

```

## serial.write(path, buffer, callback[error|null])
- this function should be called after calling ```serial.open```. path argument is same as ```serial.open```.
- The buffer parameter accepts a Buffer object, or a type that is accepted by the Buffer constructor (ex. an array of bytes or a string).
- called upon writing data. First argument is error object if error occured or null.

## serial.parsers
- same as parsers provided by serialport library. Documentation for the same is here: https://github.com/voodootikigod/node-serialport#parsers

## serial.enable(path, callback)
- this is optional function provided to just enable serialport on BeagleBone. It does not open port ut just performs pinMode on respective pins
- path argument is same as ```serial.open```.
