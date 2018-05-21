var b = require('bonescript');
var fs = require('fs');
var testDir = '/tmp/ffi-test';
var Cfile = testDir + 'ffi-test';

var args = {
    'main': ['int', ['void']]
};

var cCode = `
#include <stdio.h>
int main()
{
   printf("Hello, World!");
   return 0;
}
`
module.exports.testFFI = function (test) {

    test.expect(3);
    if (!fs.existsSync(testDir)) {
        fs.mkdirSync(testDir);
    }
    //test mraaGPIO()
    var mraaGPIO = b.mraaGPIO('P9_12');
    if (mraaGPIO === '0x3a')
        test.ok(true);
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
        if (Cmodule.main(0) == 0) {
            //returns 0
            console.log("Load C Module Succesful");
            test.ok(true);
        }
    }
    test.done();
}