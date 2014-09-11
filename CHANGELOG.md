ChangeLog
---------

### 0.3.2

* Support for 3.2 kernel has been dropped
* Required nodejs version is now >= 0.10.24. Effecively, the octalbonescript won't install on Angstrom distribution
* pinMode now takes only 4 arguments -> (pin, direction, mode, callback). Whereas valid values of mode is "gpio", "gpio_pu", "gpio_pd", "pwm". _pu and _pd indicate pull-up and pull-down modes of the pins.
* Support for WatchDog timer added. It can be accessed via startWatchdog() and stopWatchdog() functions.

### 0.3.1

* Small bug fixes

### 0.3.0

* Universal and HDMI cape loaded as per compatibility
* 2 new dts overlays bs_univ_template and bs_hdmi_template added
* Changed name of bone.js to pinmap.js to better reflect its content
* Pins P8_7, P8_8, P8_9 should now be used as P8_07, P8_08, P8_09
