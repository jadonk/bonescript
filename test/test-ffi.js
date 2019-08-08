var b = require('bonescript');
var fs = require('fs');
var testDir = '/tmp/ffi-test';
var Cfile = testDir + '/ffi-test';
var Cfile1 = testDir + '/ffi-test1';
var txtFile = testDir + '/txt-test.txt'
var txtFile1 = testDir + '/txt-test1.txt'
var args = {
    'dummy': ['int', ['void']]
};
var text = "HELLO";
var cCode = `
#include <stdio.h>
int dummy()
{
   printf("Hello, World!");
   return 0;
}
`
module.exports.testFFI = function (test) {

    test.expect(8);
    if (!fs.existsSync(testDir)) {
        fs.mkdirSync(testDir);
    }
    //test writetxtFile
    b.writeTextFile(txtFile, text);
    if (fs.existsSync(txtFile)) {
        console.log("Write Text File Successful");
        test.ok(true);
    }
    //test readtxtFile
    if (b.readTextFile(txtFile) == text) {
        console.log("Read Text File Successful");
        test.ok(true);
    }
    //test mraaGPIO()
    var mraaGPIO = b.mraaGPIO('P9_12');
    if (mraaGPIO === '0x3a') {
        console.log("MRAA Library Load Successful");
        test.ok(true);
    }
    //test writeCModule
    b.writeCModule(Cfile, cCode);
    if (fs.existsSync(Cfile + '.c')) {
        console.log("Write C Module Successful");
        test.ok(true);
    }
    //test loadCModule
    var Cmodule = b.loadCModule(Cfile, args);
    if (Cmodule == "ffi not loaded") {
        console.log("Load C Module Unsuccesful(ffi not loaded)");
        test.ok(true);
    } else {
        var moduleRetVal = Cmodule.dummy(0);
        //returns 0
        console.log("Load C Module Succesful, returned: " + moduleRetVal);
        test.ok(moduleRetVal == 0);
    } //test writetxtFile with callback
    b.writeTextFile(txtFile1, text, function (x) {
        if (!x.err)
            test.ok(true);
        onWriteTextFile();
    });
    //test readtxtFile with callback
    function onWriteTextFile() {
        b.readTextFile(txtFile1, function (err, data) {
            if (!err && data == text)
                test.ok(true);
            onReadTextFile()
        })
    }
    //test writeCModule with callback
    function onReadTextFile() {
        b.writeCModule(Cfile1, cCode, function (x) {
            if (!x.err)
                test.ok(true);
            test.done();
        });
    }
}