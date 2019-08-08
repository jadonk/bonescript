BoneScript
==========

[![Join the chat at https://gitter.im/jadonk/bonescript](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/jadonk/bonescript?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
[![Build Status](https://travis-ci.org/jadonk/bonescript.svg?branch=0.5.x)](https://travis-ci.org/jadonk/bonescript)
[![Coverage Status](https://img.shields.io/coveralls/jadonk/bonescript.svg)](https://coveralls.io/r/jadonk/bonescript)

BoneScript is a node.js library for physical computing on embedded Linux,
starting with support for BeagleBone.

Information on the language is available at http://nodejs.org.

To check the version and to see if BoneScript is in your path, try running:
````sh
node -pe "require('bonescript').getPlatform().bonescript"
````

Additional documentation is available at http://beagleboard.org/bonescript.

The concept is to use Arduino-like functions written in JavaScript to
simplify learning how to do physical computing tasks under embedded Linux
and to further provide support for rapidly creating GUIs for your embedded
applications through the use of HTML5/JavaScript web pages.


Global Installation
-------------------
BoneScript comes installed on your BeagleBone. To update to the latest revision, use 'npm'
on a recent BeagleBoard.org Debian image from https://beagleboard.org/latest-images
and perform:
````sh
TERM=none sudo npm cache clear
TERM=none sudo npm install -g --prefix /usr/local --unsafe-perm bonescript
sudo shutdown -r now
````

Testing on other distributions is limited.

There are some additional installation steps that can be performed, but are typically
installed by other mechanisms on the BeagleBoard.org Debian images. These setup
background services (bone101 webserver with bonescript RPC and bonescript autorun
service) as well as configure environment variables for these services and other
globally run scripts.
````sh
sudo cp bonescript/etc/default/node /etc/default/node
sudo cp bonescript/etc/profile.d/node.sh /etc/profile.d/node.sh
sudo cp bonescript/systemd/\* /lib/systemd/system
sudo systemctl enable bonescript.socket
sudo systemctl enable bonescript-autorun.service
````

Launching applications persistently
-----------------------------------
To have your applications launch on startup, simply drop them into the
/var/lib/cloud9/autorun folder.  Moving them out of that folder will kill
the processes.  You are expected to only drop in already bug-free apps into
this folder as there isn't a good way to perform debug on them.

Note on code state
==================
There's still a lot of development going on, so be sure to check back on a 
frequent basis.  Many of the fancier peripherals aren't yet supported
except through performing file I/O.

Directory layout
----------------
* index.js: Main BoneScript source code
* autorun.js: Node.JS app to run apps dropped in the autorun folder
* package.json: NPM.JS package descriptor
* server.js: BoneScript web server to serve up remote procedure calls
* dts: Devicetree templates
* etc: Configuration files to be placed in target distro
* src: Library source code
* systemd: Configuration files for systemd to start services
* test: To-be-automated test code

Template
========
For a BoneScript application, you must currently manually 'require' the
bonescript library.  Functions are then referenced through the object
provided back from require.

I started out trying to provide Arduino-like setup/loop functions, but the
idea really isn't a good match for JavaScript.  Using JavaScript's native
flow works best, but the familiar functions are enough to give you a boost
in your physical computing productivity.

Here's an example:

````javascript
var b = require('bonescript');

b.pinMode('P8_12', b.INPUT);
b.pinMode('P8_13', b.OUTPUT);

setInterval(copyInputToOutput, 100);

function copyInputToOutput() {
    b.digitalRead('P8_12', writeToOutput);
    function writeToOutput(x) {
        b.digitalWrite('P8_13', x.value);
    }
}
````

The 'P8\_12' and 'P8\_13' are pin names on the board and the above example
would copy the input value at P8\_12 to the output P8\_13 every 100 ms.


API
===
When a callback is provided, the functions will behave asynchronously.
Without a callback provided, the functions will synchronize and complete
before returning.

System
------
* getPlatform([callback]) -> platform
* getEeproms([callback]) -> eeproms
* echo(data, [callback]) -> data
* readTextFile(filename, [callback]) -> data
* writeTextFile(filename, data, [callback])
* setDate(date, [callback])

Digital and Analog I/O
----------------------
* analogRead(pin, [callback]) -> value
* analogWrite(pin, value, [freq], [callback])
* attachInterrupt(pin, handler, mode, [callback])
* detachInterrupt(pin, [callback])
* digitalRead(pin, [calback]) -> value
* digitalWrite(pin, value, [callback])
* pinMode(pin, direction, [mux], [pullup], [slew], [callback])
* getPinMode(pin, [callback]) -> pinMode
* shiftOut(dataPin, clockPin, bitOrder, val, [callback])

Serial
------
Uses https://github.com/voodootikigod/node-serialport
* serialOpen(port, options, [callback])
* serialWrite(port, data, [callback])
* serialParsers is serialport.parsers

I2C
---
Uses https://github.com/korevec/node-i2c
* i2cOpen(port, address, options, [callback])
* i2cScan(port, [callback])
* i2cWriteByte(port, byte, [callback])
* i2cWriteBytes(port, command, bytes, [callback])
* i2cReadByte(port, [callback])
* i2cReadBytes(port, command, length, [callback])
* i2cStream(port, command, length, [callback])

Robot Control
-------------
__new in 0.7.0__ Runs on BeagleBone Blue; or BeagleBone Black or BeagleBone Black Wireless with BeagleBoard.org Robotics Cape
* rcInitialize([callback])
* rcState([state], [callback]) -> state
* rcLED(led, [value], [callback]) -> value
* rcOn(event, [callback])
* rcMotor(motor, value, [callback])
* rcServo(option, value, [callback])
* rcBMP([option], [callback]) -> value
* rcIMU([option], [callback]) -> value
* rcEncoder(encoder, [value], [callback]) -> value

Bits/Bytes, Math, Trigonometry and Random Numbers
-------------------------------------------------
* lowByte(value)
* highByte(value)
* bitRead(value, bitnum)
* bitWrite(value, bitnum, bitdata) 
* bitSet(value, bitnum) 
* bitClear(value, bitnum) 
* bit(bitnum)
* min(x, y)
* max(x, y)
* abs(x)
* constrain(x, a, b)
* map(value, fromLow, fromHigh, toLow, toHigh)
* pow(x, y)
* sqrt(x)
* sin(radians)
* cos(radians)
* tan(radians)
* randomSeed(x)
* random([min], max)


Note on performance
===================
This code is totally unoptimized.  The list of possible optimizations that run
through my head is staggering.  The good news is that I think it can all be
done without impacting the API, primarily thanks to the introspection
capabilities of JavaScript.

Eventually, this is planned to enable real-time usage, directly from
JavaScript.  The plan is to attact the ability to use this programming environment
in real-time on several fronts:
* Enabling multiple loops and analyzing them to determine if they can be off-
  loaded to a PRU.  This will be the primary mechanism for providing real-time
  servicing of the IOs.
* Providing higher-order services that utilize the standard peripherals for
  their intended use:
  - Serial drivers for I2C, SPI, UARTs, etc.
  - analogWrite for PWMs using hardware PWMs, timers, kernel GPIO drivers, etc.
* Adding real-time patches to the kernel


The JavaScript language provides some features that I think are really cool
for doing embedded programming and node.js does some things to help enable
that.  The primary one is that the I/O functions are all asynchronous.  For
embedded systems, this is especially useful for performing low-latency tasks
that respond to events in the system.  What makes JavaScript so much easier
than other languages for doing this is that it keeps the full context around
the handler, so you don't have to worry about it.

What's New
==========

0.7.0 key updates
-----------------
Most of these fixes came from a [Google Summer of Code 2018 project](https://github.com/vaishnav98/bone101/wiki/BeagleBoard-GSoC'18:-Fixing-Bugs-in-BoneScript-and-Improving-BeagleBone-User-Interface)
* Fixes in PWM output during analogWrite updates
* Added function calls for Robot Control library support on BeagleBone Blue or Robotics Cape
* Added support for node-style callbacks with error and data separated (optional)

Plans
=====
* SPI support
* PRU support
* Handling array of pins in pinMode and getPinMode
* Saving off created dtbo and writing configuration to cape EEPROM

