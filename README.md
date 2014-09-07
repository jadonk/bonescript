Getting started
===============

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

Information on the language is available at http://nodejs.org.

To check the version and see BoneScript is in your path, try running:
````sh
node -pe "require('octalbonescript').getPlatform().bonescript"
````

Additional documentation is available at http://beagleboard.org/bonescript.

The concept is to use Arduino-like functions written in JavaScript to
simplify learning how to do physical computing tasks under embedded Linux
and to further provide support for rapidly creating GUIs for your embedded
applications through the use of HTML5/JavaScript web pages.


Installation
------------
BoneScript comes installed on your BeagleBone. To update
to the latest revision or install it on another distribution, use 'npm':

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

Please note that this version of bonescript does __not__ work with Angstrom distribution. We recommend that you upgrade your beaglebone to Debian by following link given below.

[http://beagleboard.org/getting-started#update](http://beagleboard.org/getting-started#update)

Deviation from Bonescript
-------------------------
OctalBoneScript is completely API compatible with bonescript. There are however a few changes which you should keep in mind while using OctalBoneScript.

	* Pins P8_7, P8_8, P8_9 needs to be written as P8_07, P8_08, P8_09 in your code

We encourage you to report if issues if you face any. We will try our best to resolve errors in the code.
