var autorun = require('bonescript').autorun;
var fs = require('fs');

exports.testAutorun = function (test) {
    var ar = autorun('/tmp/autorun-test');
    var apps = ar.getApps();
    var emitter = ar.getEmitter();
    test.expect(2);
    setTimeout(onTimeout, 3000);

    emitter.on('start', function (file) {
        test.ok(true);
        fs.unlink('/tmp/autorun-test/autorun-test.js', onUnlink);
    });

    emitter.on('closed', function (file) {
        ar.stop();
        test.ok(true);
    });

    if (!fs.existsSync('/tmp/autorun-test')) {
        fs.mkdirSync('/tmp/autorun-test');
    }
    fs.writeFileSync('/tmp/autorun-test/autorun-test.js', 'console.log("got here.");');
    console.log('Wrote /tmp/autorun-test/autorun-test.js');

    function onUnlink() {
        console.log('autorun-test.js deleted');
    }

    function onTimeout() {
        test.done();
    }
};