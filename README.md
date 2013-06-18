Getting started
===============
Bonescript is a node.js library for physical computing on embedded Linux,
starting with support for BeagleBone.

Information on the language is available at http://nodejs.org.

To get started, try running 'node blinkled.js' on a BeagleBone.

Additional documentation is available at http://beagleboard.org/bonescript.

The concept is to use Arduino-like functions written in JavaScript to
simplify learning how to do physical computing tasks under embedded Linux
and to further provide support for rapidly creating GUIs for your embedded
applications through the use of HTML5/JavaScript web pages.


Installation
------------
Bonescript comes installed on your BeagleBone.  If you are looking to update
to the latest revision, use 'opkg' to perform the update:

````sh
opkg update
opkg install bonescript
````

Support for other distributions is a work in progress.


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

Brief introduction to the file structures
==================
To get developers(or potential contributors) know Bonescript better, below
is a brief introduction to the directories and files included.

* node_modules

The Bonescript source code,currently it depends on `express`, `socket.io`, `systemd` and `winston`, for more information to the specified library, please refer to their homepage or wiki.

* etc

The environment file for Bonescript.

* systemd

The bonescript-autorun service configuration files.

* attic

A nice demo about using Bonescript as a Weather Station, utilizing BMP085 to get pressure and temperature, SHT21 to get humidity and TSL2550 as the Light Sensor.

* usage-demos

Small demos to focus on the usage of Bonescript, do refer to them to get a real quick start with Bonescript.

Template
========
For a Bonescript application, you must currently manually 'require' the
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

Digital I/O, Analog I/O, and Advanced I/O
-----------------------------------------
* analogRead(pin, [callback]) -> value
* analogWrite(pin, value, [freq], [callback])
* attachInterrupt(pin, handler, mode, [callback])
* detachInterrupt(pin, [callback])
* digitalRead(pin, [calback]) -> value
* digitalWrite(pin, value, [callback])
* getEeproms([callback]) -> eeproms
* pinMode(pin, direction, [mux], [pullup], [slew], [callback])
* getPinMode(pin, [callback]) -> pinMode
* shiftOut(dataPin, clockPin, bitOrder, val, [callback])

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


Short-term issues
=================
* The state of the ARM Linux kernel with regards to handling loading drivers
  using devicetree is still in a lot of flux.  Many of the interfaces
  Bonescript utilizes are being rewritten and refactored.

