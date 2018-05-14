var autorun = require('bonescript').autorun;
var fs = require('fs');

exports.testAutorun = function (test) {
    var ar = autorun('./autorun-test');
    var apps = ar.getApps();
    var emitter = ar.getEmitter();
    test.expect(2);
    setTimeout(onTimeout, 1000);

    emitter.on('start', function (file) {
        test.ok(true);
        fs.unlink('./autorun-test/autorun-test.js', onUnlink);
    });

    emitter.on('closed', function (file) {
        ar.stop();
        test.ok(true);
    });

    if (!fs.existsSync('./autorun-test')) {
        fs.mkdirSync('./autorun-test');
    }
    fs.writeFileSync('./autorun-test/autorun-test.js', 'console.log("got here.");');

    function onUnlink() {
        console.log('autorun-test.js deleted');
    }

    function onTimeout() {
        test.done();
    }
};