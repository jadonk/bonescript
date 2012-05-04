var misc = require('./misc');

console.log('Calling pollpri');
misc.pollpri('my path', function(err, data) {
    console.log(''+data);
});
