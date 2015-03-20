I2C Port
========

BeagleBone has in-built I2C port functionality and OctalBoneScript provides a way to access it without loading any aditional cape.
These functions are essentially wrapper around [I2C](https://github.com/kelly/node-i2c) library.

We recommned that you use these functions instead of the library because these functions automatically performs required
pinMode on the pins to make them ready for serial communication.

**Please note that original bonescript functions like ```i2cOpen``` are deprecated and you must use
```i2c.open``` like functions documented below.**

## i2c.open(path, address, handler[data], callback[error|null, wire])
- path is i2c port path for BeagleBone. vaild values are ```/dev/i2c-1```, ```/dev/i2c-1a``` and ```/dev/i2c-2```
- address is hexadecimal address identifier eg. 0x18
- handler is called with data as first arguemnt when data is received on I2C port
- callback first argument is verror object if there is error opening port, null otherwise. second argument is same object you get after calling ```new i2c``` function of the library as described here: https://github.com/kelly/node-i2c#usage

**Example**
```javascript

var b = require('octalbonescript'); //load the library

b.i2c.open('/dev/i2c-1', 0x018, function(data){
  console.log(data);
}, function(error, wire){
  if(error){
    console.error(error.message);
    return;
  }
  // 'wire' is object which can be used to call other functions on it 
  // as per described here https://github.com/kelly/node-i2c#usage
  // you can call writeByte, readByte etc functions on 'wire'.
});

```

## i2c.enable(path, callback)
- this is optional function if you just want to enable i2c port. It prepares pins used by i2c port by calling pinMode on them

## Other functions
- this library provides wrapper functions ```i2c.writeByte```, ```i2c.writeBytes```, ```i2c.readByte```, ```i2c.write```, ```i2c.stream```, and ```i2c.read```.
- all these functions are same as functions described here: https://github.com/kelly/node-i2c#usage but they all have first argument as path of i2c port and rest all argument and functionalities are same.

**Example**
```javascript

var b = require('octalbonescript'); //load the library

b.i2c.writeByte('/dev/i2c-1', byte, function(err){
  if(err){
    console.error(err);
    return;
  }
  // note that first argument is path of i2c port and other arguments are same.
});

```
