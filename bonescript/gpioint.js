var events = require('events');
var misc = require('./misc');
for(var x in events.EventEmitter.prototype) {
    misc.Pollpri.prototype[x] = events.EventEmitter.prototype[x];
}

if(process.argv.length > 2) {
    var file = process.argv[2];
    var gpioPoll = new misc.Pollpri(file);
    var gpioHandler = function(value) {
        console.log(''+value);
    };
    gpioPoll.on('edge', gpioHandler);
} else {
    var onMessage = function(m) {
        console.log('Attaching handler to ' + m.file);
        var gpioPoll = new misc.Pollpri(m.file);
        var gpioHandler = function(value) {
            console.log('Got interrupt event');
            process.send({'value': value});
        };
        gpioPoll.on('edge', gpioHandler);
    };
    process.on('message', onMessage);
    console.log('Started GPIO interrupt listener');
}
