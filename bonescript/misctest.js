var fs = require('fs');
var events = require('events');
var filename = '/sys/class/gpio/gpio34/value';
var misc = require('./misc');
for(var x in events.EventEmitter.prototype) {
    misc.Pollpri.prototype[x] = events.EventEmitter.prototype[x];
}
var pollpri = new misc.Pollpri(filename);
pollpri.on('edge', function(data) {console.log(''+data);});

while(1) {}