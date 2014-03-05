var b = require('bonescript');

b.pinMode('P8_19', b.INPUT, undefined, undefined, undefined, doRead);

function doRead() {
    b.digitalRead('P8_19', function(x) {
        console.log(JSON.stringify(x));
    });
}
