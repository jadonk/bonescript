var bone = require('./bone');
var fs = require('fs');
var shell = require('shelljs');
var winston = require('winston');
var my = require('./my');
var ffi = my.require('ffi');

var mraaGPIO = function (pin) {
    var pinObject = bone.getPinObject(pin);
    var pinNo;
    if (typeof pinObject != 'object') {
        throw ("Invalid pin: " + pin);
    }
    if (pinObject.key.indexOf('P8') != -1) {
        pinNo = Number(pinObject.key.replace('P8_', ''));
    } else if (pinObject.key.indexOf('P9') != -1) {
        pinNo = Number(pinObject.key.replace('P9_', ''));
        pinNo += 46;
    }
    return '0x' + pinNo.toString(16);
};

var writeCModule = function (filename, data, callback) {
    if (filename.indexOf(".c") == -1)
        filename += ".c";
    if (typeof callback == 'function') {
        var cb = function (err) {
            callback({
                'err': err
            });
        };
        fs.writeFile(filename, data, 'utf-8', cb);
    } else {
        try {
            return fs.writeFileSync(filename, data, 'utf-8');
        } catch (ex) {
            winston.error("writeCModule error: " + ex);
            return (false);
        }
    }
};

var loadCModule = function (path, args, mraa) {
    //compile at the path if shared object does not exist 
    if (path.indexOf('.c') != -1)
        path = path.replace('.c', '');
    mraa = mraa || false; // link mraa 
    if (!my.file_existsSync(path + '.so')) {
        var outPath = path + '.so';
        var inPath = path + '.c';
        if (mraa)
            shell.exec('gcc -shared -fpic ' + inPath + ' -o ' + outPath + ' -lmraa');
        else
            shell.exec('gcc -shared -fpic ' + inPath + ' -o ' + outPath);
    }
    if (ffi.exists)
        return ffi.Library(path, args);
    else {
        winston.debug("Could not load module FFI");
        return "ffi not loaded"
    }
};

module.exports = {
    mraaGPIO: mraaGPIO,
    loadCModule: loadCModule,
    writeCModule: writeCModule
}