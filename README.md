OctalBoneScript
===============
A more stable, continuously tested and better node.js library for scripting BeagleBone

__v1.0.0 introduces major BC breaks. Please refer to [releases](https://github.com/theoctal/octalbonescript/releases) to see the changes made in latest version. Code examples for latest version is available [here](https://github.com/theoctal/octalbonescript/blob/master/docs/examples.md).__

Installation
------------
OctalBoneScript can be installed on beaglebone and beaglebone black. Run following command as root.

````sh
npm install -g octalbonescript
````

__Please note that Octalbonescript does not recommend Linux Angstrom. We strongly recommend that you upgrade your BeagleBone to Debian by following link given below:__

[http://beagleboard.org/getting-started#update](http://beagleboard.org/getting-started#update)

Fork
----
This is a fork of https://github.com/jadonk/bonescript. Some APIs are changed in v1.0.0, and we have changed many things under the hood leading to a much better, more functional and faster version of the original library. 

This fork is created to make bonescript more feature rich, faster, fix bugs and make it work in 
simulator mode under Mac OSX and Linux.

The concept is to use Arduino-like functions written in JavaScript to
simplify learning how to do physical computing tasks under embedded Linux
and to further provide support for rapidly creating GUIs for your embedded
applications through the use of HTML5/JavaScript web pages.

Additional features not present in original bonescript
------------------------------------------------------

### Debug Mode
Debug mode can be activated as per below.

```JavaScript
DEBUG=bone node yourscript.js
```

### Watchdog timer

OctalBoneScript has functionality to use BeagleBone onboard watchdog timer. A sample code is given below.

```JavaScript
b = require('octalbonescript');

b.watchdog.start(); 	// This function starts watchdog timer. 
					// The board will reboot if it becomes
					// unresponsive for more than 60 seconds.

b.watchdog.stop();	// This function stops the watchdog timer.
```

Differences from bonescript
-------------------------
OctalBoneScript is mostly API compatible with actual bonescript. There are a few changes which you should keep in mind though.

* Pins P8_7, P8_8, P8_9 have to be denoted as P8_07, P8_08, P8_09 in your code.
* ```pinMode``` function now takes only 3 arguments. Please also note that this function is fully __asynchronous__ therefore always use callback to know whether the pinMode execution has occured successfully. Its format is: ```pinmode(pin, direction, callback)```. Additional direction variable ```INPUT_PULLDOWN``` is also added. It asserts mode automatically and sets slew rate as fast by default.
* ```startAnalog(pin, callback)``` and ```stopAnalog(pin, callback)``` function added to start/stop analog output on pin.
* __All callbacks now follow ```callback(err, resp)``` format as per NodeJs standards. This is a major BC break in v1.0.0. The previos format was ```callback(resp)```__
* ```serialOpen``` and ```i2cOpen``` should now be used as ```serial.open``` and ```i2c.open```. Please check docs forlder for examples on this.
* Any serial or I2C capes are no longer required if you use OctalBoneScript. Just using above serial and I2C functions will be sufficient.


We encourage you to report issues rightaway if you face any. We will try our best to be of help.
