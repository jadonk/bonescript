ChangeLog
---------

### 0.4.11
* This version and all pervious versions were bug fixes

### 0.4.6
* Bug fix for universal cape load when HDMI is not disabled

### 0.4.5
* Bug fix.

### 0.4.4
* Bug fixes in analogWrite function. ```startAnalog(pin, callback)``` function added

### 0.4.3
* All the express, socket.io and cloud9 dependencies removed. The library now focuses only on providing better I/O functionality for BeagleBone rather than serving to cloud9 IDE
* Removed usage of FFI and moved to 'shelljs' to compile universal device tree

### 0.4.2
* ```stopAnalog(pin, callback)``` function added to ust stop the analog output on given pin. Call ```analogWrite``` again on that pin to start analog output (see v0.4.4 for update)

### 0.4.1
* Better warning in pinMode

### 0.4.0 (Major update. Introduces BC break)

* Support for 3.2 kernel has been dropped
* Individual pin based "hw_capemgr" is no longer supported. Universal cape manager handles all the tasks of pin muxing
* Required nodejs version is now >= 0.10.24. Effecively, the octalbonescript won't install on Angstrom distribution
* __BC Break__ ```pinMode``` function now takes only 3 arguments -> (pin, direction, callback). This function now asserts mode automatically and sets slew rate as fast. Additional direction variable ```INPUT_PULLDOWN``` is also added. 
* __BC Break__ ```pinMode``` function is now fully async unlike original bonescript. Please use callback to know the status.
* Support for WatchDog timer added. It can be accessed via ```startWatchdog()``` and ```stopWatchdog()``` functions

### 0.3.1

* Small bug fixes

### 0.3.0

* Universal and HDMI cape loaded as per compatibility
* 2 new dts overlays bs_univ_template and bs_hdmi_template added
* Changed name of bone.js to pinmap.js to better reflect its content
* Pins P8_7, P8_8, P8_9 should now be used as P8_07, P8_08, P8_09
