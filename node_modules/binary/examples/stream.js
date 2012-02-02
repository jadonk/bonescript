var Binary = require('binary');
var stdin = process.openStdin();

Binary.stream(stdin)
    .word32lu('x')
    .word16bs('y')
    .word16bu('z')
    .tap(function (vars) {
        console.dir(vars);
    })
;
