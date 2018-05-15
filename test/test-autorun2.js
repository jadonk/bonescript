var autorun = require('bonescript').autorun;
var fs = require('fs');
var testDir = '/tmp/autorun-test';
var file0 = 'autorun-test0.js';
var file1 = 'autorun-test1.js';

exports.testAutorun = function (test) {
    var ar = autorun('/tmp/autorun-test');
    var apps = ar.getApps();
    var emitter = ar.getEmitter();
    test.expect(2);
    setTimeout(onTimeout, 500);

    emitter.on('start', function (file) {
        console.log('Started ' + file);
        if (file == file1) {
            test.ok(true);
            fs.unlink(file1, onUnlink);
        }
    });

    emitter.on('closed', function (file) {
        if (file == file1) {
            ar.stop();
            test.ok(true);
        }
    });

    if (!fs.existsSync(testDir)) {
        fs.mkdirSync(testDir);
    }

    try {
        fs.unlinkSync(file0);
    } catch (ex) {
        console.log('Unable to delete ' + file0);
    }
    fs.writeFileSync(file0, 'console.log("got here in ' + file0 + '");');
    console.log('Wrote ' + file0);
    fs.writeFileSync(file1, 'console.log("got here in ' + file1 + '");');
    console.log('Wrote ' + file1);

    function onTimeout() {
        console.log('Done');
        test.done();
    }

    function onUnlink() {
        console.log(file1 + ' deleted');
    }
};