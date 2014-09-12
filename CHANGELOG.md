ChangeLog
---------

### 0.4 (Major update. Introduces BC break)

* Support for 3.2 kernel has been dropped
* Individual pin based "hw_capemgr" is no longer supported. Universal cape manager handles all the tasks of pin muxing
* Required nodejs version is now >= 0.10.24. Effecively, the octalbonescript won't install on Angstrom distribution
* __BC Break__ ```pinMode``` function now takes only 4 arguments -> (pin, direction, mode, callback). Whereas valid values of mode is "gpio", "gpio_pu", "gpio_pd", "pwm". _pu and _pd indicate pull-up and pull-down modes of the pins
* __BC Break__ ```pinMode``` function is now fully async unlike original bonescript. Please use callback to know the status.
* Support for WatchDog timer added. It can be accessed via ```startWatchdog()``` and ```stopWatchdog()``` functions

### 0.3.1

* Small bug fixes

### 0.3.0

* Universal and HDMI cape loaded as per compatibility
* 2 new dts overlays bs_univ_template and bs_hdmi_template added
* Changed name of bone.js to pinmap.js to better reflect its content
* Pins P8_7, P8_8, P8_9 should now be used as P8_07, P8_08, P8_09
