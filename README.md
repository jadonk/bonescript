Getting started
===============

__Please note that octalbonescript does not work with Angstrom distribution. We recommend that you upgrade your beaglebone to Debian by following link given below__

[http://beagleboard.org/getting-started#update](http://beagleboard.org/getting-started#update)

Fork
----
This is a fork of https://github.com/jadonk/bonescript. While the APIs are 
same as original bonescript, we have changed many things under the hood. 

This fork is created to make bonescript faster, fix bugs and make it work in 
simulator mode under Mac OSX. We will also try to bring all features of bonescript
as and when new version of bonescript is released. If we are lagging behind, just
ping us and we will update.

OctalBoneScript is a node.js library for physical computing on embedded Linux,
starting with support for BeagleBone.

The concept is to use Arduino-like functions written in JavaScript to
simplify learning how to do physical computing tasks under embedded Linux
and to further provide support for rapidly creating GUIs for your embedded
applications through the use of HTML5/JavaScript web pages.


Installation
------------
OctalBoneScript can be installed on beaglebone and beaglebone black. Run following command as root.

````sh
TERM=none npm install -g octalbonescript
````

Debian and Ubuntu prerequisites:
* Credit to http://learn.adafruit.com/introduction-to-the-beaglebone-black-device-tree/compiling-an-overlay
````sh
sudo apt-get install -y build-essential g++ python-setuptools python2.7-dev
wget -c https://raw.github.com/RobertCNelson/tools/master/pkgs/dtc.sh
chmod +x dtc.sh
./dtc.sh
````

Additional features not present in original bonescript
------------------------------------------------------

### Watchdog timer

OctalBoneScript has functionality to use BeagleBone onboard watchdog timer. A sample code is given below.

```JavaScript
b = require('octalbonescript');

b.startWatchdog(); 	// This function starts watchdog timer. 
					// The board will reboot if it becomes
					// unresponsive for more than 60 seconds.

b.stopWatchdog();	// This function stops the watchdog timer.
```

Deviation from Bonescript
-------------------------
OctalBoneScript is completely API compatible with bonescript. There are however a few changes which you should keep in mind while using OctalBoneScript.

* Pins P8_7, P8_8, P8_9 needs to be written as P8_07, P8_08, P8_09 in your code
* ```pinMode``` function now takes only 4 arguments. Please also note that this function is fully __asynchronous__ therefore use callback to know whether the pinMode execution is complete. Its format is: ```pinmode(pin, direction, mode, callback)```. While first two arguments are similar to bonescript, third argument takes one of the folloing values.
  1. "gpio" for gpio mode
  2. "gpio_pu" for gpio input with pullup resistor
  3. "gpio_pd" for gpio input with pulldown resistor
  4. "pwm" for analog output pins

We encourage you to report if issues if you face any. We will try our best to resolve errors in the code.
