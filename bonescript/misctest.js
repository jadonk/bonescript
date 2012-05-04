var fs = require('fs');
var filename = '/sys/class/gpio/gpio34/value';
var misc = require('./misc');
var pollpri = new misc.Pollpri(filename);

var readdata = function(err, data) {
    console.log(data + ': ' + fs.readFileSync(data, 'utf-8'));
    pollpri.pollpri(readdata);
};

pollpri.pollpri(readdata);