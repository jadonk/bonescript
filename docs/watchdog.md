Watchdog
========

BeagleBone has in-built watchdog functionality. The helper function provides way to enable or disable watchdog timer.
If the timer is enabled and the board becomes unresponsive for 60 seconds, it will automatically reboot.

## startWatchdog(callback[err|null])
- starts watchdog timer. callback first argument is 'verror' object or null

**Example**
```javascript

var b = require('octalbonescript'); //load the library
b.startWatchdog(function(err){
  if(err){
    console.error(err.message);
  }
});

```

## stoptWatchdog(callback[err|null])
- stops watchdog timer. callback first argument is 'verror' object or null

**Example**
```javascript

var b = require('octalbonescript'); //load the library
b.stoptWatchdog(function(err){
  if(err){
    console.error(err);
  }
});

```
