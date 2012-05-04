var misc = require('./misc');
var fs = require('fs');

var filename = '/sys/class/gpio/gpio34/value';

console.log('Calling pollpri');
misc.pollpri(filename, function(err, data) {
    console.log(data + ': ' + fs.readFileSync(filename, 'utf-8'));
});
