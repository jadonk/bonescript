var misc = require('./misc');

console.log('Calling pollpri');
misc.pollpri('/sys/class/gpio/gpio34/value', function(err, data) {
    console.log(''+data);
});
