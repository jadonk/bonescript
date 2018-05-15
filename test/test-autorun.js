var autorun = require('bonescript').autorun;
var fs = require('fs');
var testDir = '/tmp/autorun-test';
var file0 = testDir + '/autorun-test0.js';
var file1 = testDir + '/autorun-test1.js';

exports.testAutorun = function (test) {
    test.expect(3);
    setTimeout(onTimeout1, 100);
    setTimeout(onTimeout2, 1000);

    if (!fs.existsSync(testDir)) {
        fs.mkdirSync(testDir);
    }
    try {
        fs.unlinkSync(file0);
    } catch (ex) {
        console.log('Unable to delete ' + file0);
    }
    try {
        fs.unlinkSync(file1);
    } catch (ex) {
        console.log('Unable to delete ' + file1);
    }
    fs.writeFileSync(file0, 'console.log("got here in ' + file0 + '");');
    console.log('Wrote ' + file0);

    var ar = autorun(testDir);
    var apps = ar.getApps();
    var emitter = ar.getEmitter();

    emitter.on('start', function (file) {
        console.log('Started ' + file);
        if (file == file1) {
            setTimeout(function () {
                fs.unlink(file1, onUnlink);
            }, 500);
            test.ok(true);
        }
    });

    emitter.on('closed', function (file) {
        if (file == file1) {
            ar.stop();
            test.ok(true);
        }
    });

    function onTimeout1() {
        fs.writeFileSync(file1, 'console.log("got here in ' + file1 + '"); setTimeout(function(){console.log("timeout")}, 3000);');
        console.log('Wrote ' + file1);
        test.ok(true);
    }

    function onTimeout2() {
        console.log('Done');
        test.done();
    }

    function onUnlink() {
        console.log('Deleted ' + file1);
    }
};