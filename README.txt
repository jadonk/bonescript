
This is not (yet) intended for real-time usage.  The plan is to attact the
ability to use this programming environment in real-time on several fronts:
* Enabling multiple loops and analyzing them to determine if they can be off-
  loaded to a PRU.  This will be the primary mechanism for providing real-time
  servicing of the IOs.
* Providing higher-order services that utilize the standard peripherals for
  their intended use:
  - Serial drivers for I2C, SPI, UARTs, etc.
  - analogWrite for PWMs using hardware PWMs, timers, kernel GPIO drivers, etc.
* Adding real-time patches to the kernel

TODO:
* Switch to a real pinmux driver
* Add P9
* Add BeagleBoard and BeagleBoard-xM
* 