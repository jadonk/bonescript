// Copyright (C) 2013 - Texas Instruments, Jason Kridner
//
// This is meant to hold some private functions
//
var fs = require('fs');
var winston = require('winston');
var child_process = require('child_process');
var bone = require('./bone');
var g = require('./constants');

var debug = process.env.DEBUG ? true : false;
var sysfsFiles = {};

var myRequire = function (packageName, onfail) {
    var y = {};
    try {
        y = require(packageName);
        y.exists = true;
    } catch (ex) {
        y.exists = false;
        if (debug) winston.debug("Optional package '" + packageName + "' not loaded");
        if (onfail) onfail();
    }
    return (y);
};

var fibers = myRequire('fibers');

var is_new_capemgr = function (callback) {
    var exists = file_existsSync('/sys/devices/platform/bone_capemgr/slots');
    if (callback) callback(exists);
    return (exists);
};

var is_capemgr = function (callback) {
    return (find_sysfsFile('capemgr', '/sys/devices', 'bone_capemgr.', callback));
};

var is_ocp = function (callback) {
    var found = find_sysfsFile('ocp', '/sys/devices', 'ocp.', callback);
    if (debug) winston.debug("is_ocp, found = " + found);
    if (typeof found == 'undefined') {
        found = find_sysfsFile('ocp', '/sys/devices/platform', 'ocp', callback);
        if (debug) winston.debug("is_ocp, found2 = " + found);
    }
    return (found);
};

var is_cape_universal = function (callback) {
    var ocp = is_ocp();
    if (debug) winston.debug('is_ocp() = ' + ocp);
    var cape_universal = find_sysfsFile('cape-universal', ocp, 'cape-universal.', callback);
    if (debug) winston.debug('is_cape_universal() = ' + cape_universal);
    return (cape_universal);
};

var find_sysfsFile = function (name, path, prefix, callback) {
    if (debug) winston.debug('find_sysfsFile(' + name + ',' + path + ',' + prefix + ')');
    if (typeof sysfsFiles[name] == 'undefined') {
        if (callback) {
            sysfsFiles[name] = file_find(path, prefix, 1, onFindCapeMgr);
        } else {
            sysfsFiles[name] = file_find(path, prefix, 1);
        }
    } else {
        if (callback) callback({
            path: sysfsFiles[name]
        });
    }

    function onFindCapeMgr(resp) {
        if (typeof resp.path == 'undefined') sysfsFiles[name] = false;
        else sysfsFiles[name] = resp.path;
        callback(resp);
    }

    return (sysfsFiles[name]);
};

file_exists = fs.exists;
file_existsSync = fs.existsSync;
if (typeof file_exists == 'undefined') {
    var path = require('path');
    file_exists = path.exists;
    file_existsSync = path.existsSync;
}

var file_find = function (path, prefix, attempts, callback) {
    var resp = {};
    resp.attempts = 0;
    if (typeof attempts == 'undefined') attempts = 1;

    if (callback) {
        fs.readdir(path, onReadDir);
    } else {
        while (resp.attempts < attempts) {
            try {
                var files = fs.readdirSync(path);
                onReadDir(null, files);
            } catch (ex) {
                if (debug) winston.debug('Error reading ' + path);
                return (resp.path);
            }
            if (resp.path) return (resp.path);
        }
        return (resp.path);
    }

    function onReadDir(err, files) {
        resp.attempts++;
        if (err) {
            resp.err = 'Error listing directory ' + path + ': ' + err;
            if (callback) callback(resp);
            return;
        }
        for (var j in files) {
            if (Array.isArray(prefix)) {
                for (var k = 0; k < prefix.length; k++) {
                    if (files[j].search(prefix[k]) == 0) {
                        resp.path = path + '/' + files[j];
                        if (callback) callback(resp);
                        return;
                    }
                }
            } else {
                if (files[j].search(prefix) === 0) {
                    resp.path = path + '/' + files[j];
                    if (callback) callback(resp);
                    return;
                }
            }
        }
        if (callback) {
            if (resp.attempts >= attempts) {
                resp.err = 'Did not find ' + prefix + ' in ' + path;
                callback(resp);
            } else {
                fs.readdir(path, onReadDir);
            }
        }
    }

    return (resp.path);
};

// Note, this just makes sure there was an attempt to load the
// devicetree fragment, not if it was successful
var load_dt = function (name, pin, resp, callback) {
    if (debug) winston.debug('load_dt(' + [name, pin ? pin.key : null, JSON.stringify(resp)] + ')');
    resp = resp || {};
    var slotsFile;
    var lastSlots;
    var writeAttempts = 0;
    var readAttempts = 0;
    if (pin) {
        var slotRegex = new RegExp('\\d+(?=\\s*:.*,bs.*' + pin.key + ')', 'gm');
    }
    var capemgr = is_capemgr();
    onFindCapeMgr({
        path: capemgr
    });

    function onFindCapeMgr(x) {
        if (debug) winston.debug('onFindCapeMgr: path = ' + x.path);
        if (typeof x.path == 'undefined') {
            resp.err = "CapeMgr not found: " + x.err;
            winston.error(resp.err);
            if (callback) callback(resp);
            return (false);
        }
        slotsFile = x.path + '/slots';
        var slots;
        try {
            slots = fs.readFileSync(slotsFile, 'ascii');
        } catch (ex) {
            resp.err = ex;
        }
        onReadSlots(resp.err, slots);
    }

    function onReadSlots(err, slots) {
        readAttempts++;
        if (err) {
            resp.err = 'Unable to read from CapeMgr slots: ' + err;
            winston.error(resp.err);
            if (callback) callback(resp);
            return (false);
        }
        lastSlots = slots;
        var index = slots.indexOf(name);
        if (debug) winston.debug('onReadSlots: index = ' + index + ', readAttempts = ' + readAttempts);
        if (index >= 0) {
            // Fragment is already loaded
            if (callback) callback(resp);
        } else if (readAttempts <= 1) {
            // Attempt to load fragment
            try {
                if (debug) winston.debug('Writing ' + name + ' to ' + slotsFile);
                fs.writeFileSync(slotsFile, name, 'ascii');
            } catch (ex) {
                resp.err = ex;
            }
            onWriteSlots(resp.err);
        } else {
            resp.err = 'Error waiting for CapeMgr slot to load';
            callback(resp);
        }
    }

    function onWriteSlots(err) {
        writeAttempts++;
        if (err) {
            resp.err = 'Write to CapeMgr slots failed: ' + err;
            if (pin && writeAttempts <= 1) unloadSlot();
            else {
                if (callback) callback(resp);
                return (false);
            }
        }
        var slots;
        try {
            slots = fs.readFileSync(slotsFile, 'ascii');
        } catch (ex) {
            resp.err = ex;
        }
        onReadSlots(resp.err, slots);
    }

    function unloadSlot() {
        var slot = lastSlots.match(slotRegex);
        if (slot && slot[0]) {
            if (debug) winston.debug('Attempting to unload conflicting slot ' +
                slot[0] + ' for ' + name);
            try {
                fs.writeFileSync(slotsFile, '-' + slot[0], 'ascii');
            } catch (ex) {
                resp.err = ex;
            }
            onUnloadSlot(resp.err);
        } else {
            if (callback) callback(resp);
            return (false);
        }
    }

    function onUnloadSlot(err) {
        if (err) {
            resp.err = "Unable to unload conflicting slot: " + err;
            callback(resp);
            return;
        }
        try {
            fs.writeFileSync(slotsFile, name, 'ascii');
        } catch (ex) {
            resp.err = ex;
        }
        onWriteSlots(resp.err);
    }

    if (debug) winston.debug('load_dt resp: ' + JSON.stringify(resp));
    if (debug) winston.debug('load_dt return: ' + (typeof resp.err == 'undefined'));
    return (typeof resp.err == 'undefined');
};

var create_dt = function (pin, data, template, load, force_create, resp, callback) {
    if (debug) winston.debug('create_dt(' + [pin.key, data, template, load, force_create, JSON.stringify(resp)] + ')');
    resp = resp || {};
    template = template || 'bspm';
    load = (typeof load === 'undefined') ? true : load;
    var fragment = template + '_' + pin.key + '_' + data.toString(16);
    var dtsFilename = '/lib/firmware/' + fragment + '-00A0.dts';
    var dtboFilename = '/lib/firmware/' + fragment + '-00A0.dtbo';

    if (force_create) {
        createDTS();
    } else {
        var exists = file_existsSync(dtboFilename);
        onDTBOExistsTest(exists);
    }

    function onDTBOExistsTest(exists) {
        if (exists) {
            onDTBOExists();
        } else {
            createDTS();
        }
    }

    function createDTS() {
        var templateFilename = require.resolve('bonescript').replace('main.js',
            'dts/' + template + '_template.dts');
        if (debug) winston.debug('Creating template: ' + templateFilename);
        var dts = fs.readFileSync(templateFilename, 'utf8');
        dts = dts.replace(/!PIN_KEY!/g, pin.key);
        dts = dts.replace(/!PIN_DOT_KEY!/g, pin.key.replace(/_/, '.'));
        dts = dts.replace(/!PIN_FUNCTION!/g, pin.options[data & 7]);
        dts = dts.replace(/!PIN_OFFSET!/g, pin.muxRegOffset);
        dts = dts.replace(/!DATA!/g, '0x' + data.toString(16));
        if (pin.pwm) {
            dts = dts.replace(/!PWM_MODULE!/g, pin.pwm.module);
            dts = dts.replace(/!PWM_INDEX!/g, pin.pwm.index);
            dts = dts.replace(/!DUTY_CYCLE!/g, 500000);
        }
        try {
            fs.writeFileSync(dtsFilename, dts, 'ascii');
        } catch (ex) {
            resp.err = ex;
        }
        onDTSWrite(resp.err);
    }

    function onDTSWrite(err) {
        if (err) {
            resp.err = 'Error writing ' + dtsFilename + ': ' + err;
            if (debug) winston.debug(resp.err);
            if (callback) callback(resp);
            return (resp);
        }
        var command = 'dtc -O dtb -o ' + dtboFilename + ' -b 0 -@ ' + dtsFilename;
        try {
            child_process.execSync(command);
        } catch (ex) {
            resp.err = ex;
        }
        dtcHandler(resp.err);
    }

    function dtcHandler(error, stdout, stderr) {
        if (debug) winston.debug('dtcHandler: ' +
            JSON.stringify({
                error: error,
                stdout: stdout,
                stderr: stderr
            }));
        if (!error) onDTBOExists();
    }

    function onDTBOExists() {
        if (debug) winston.debug('onDTBOExists()');
        if (load) load_dt(fragment, pin, resp);
    }

    if (callback) callback(resp);
    return (typeof resp.err == 'undefined');
};

var myeval = function (x) {
    winston.debug('myeval("' + x + '");');
    var y;
    try {
        y = eval(x);
    } catch (ex) {
        y = undefined;
        winston.error('myeval error: ' + ex);
        throw ('myeval error: ' + ex);
    }
    winston.debug('result = ' + y);
    return (y);
};

var getpin = function (pin) {
    if (typeof pin == 'object') return (pin);
    else {
        var pinObject = bone.getPinObject(pin);
        if (typeof pinObject != 'object') {
            throw ("Invalid pin: " + pin);
        }
        return (pinObject);
    }
};

var wrapCall = function (m, func, funcArgs, cbArgs) {
    if (!m.module.exists) {
        if (debug) winston.debug(m.name + ' support module not loaded.');
        return (function () {});
    }
    funcArgs.unshift('port');
    funcArgs.push('callback');
    var newFunction = function () {
        var args = [];
        var port = arguments[0];
        var callback = false;
        for (var i = 1; i < arguments.length; i++) {
            winston.debug('Adding argument ' + funcArgs[i] + ' to wrapper');
            if (funcArgs[i] == 'callback') {
                callback = arguments[i];
                var wrappedCallback = function () {
                    var cbData = {};
                    for (var j = 0; j < cbArgs.length; j++) {
                        cbData[cbArgs[j]] = arguments[j];
                    }
                    cbData.event = 'callback';
                    winston.debug('cbData = ' + JSON.stringify(cbData));
                    callback(cbData);
                };
                args.push(wrappedCallback);
            } else {
                args.push(arguments[i]);
            }
        }
        if (!m.openPorts[port]) {
            if (callback) callback({
                'err': m.name + ' ' + port + ' not opened'
            });
            return (false);
        }
        winston.debug('Calling ' + m.name + '[' + port + '].' + func + '(' + args + ')');
        var x = m.openPorts[port][func].apply(
            m.openPorts[port], args);
        if (callback) callback({
            'event': 'return',
            'return': x
        });
        return (x);
    };
    newFunction.args = funcArgs;
    return (newFunction);
};

var wrapOpen = function (m, openArgs) {
    if (!m.module.exists) {
        if (debug) winston.debug(m.name + ' support module not loaded.');
        return (function () {});
    }
    openArgs.unshift('port');
    openArgs.push('callback');
    var newFunction = function () {
        var args = {};
        for (var i = 0; i < openArgs.length; i++) {
            args[openArgs[i]] = arguments[i];
        }
        var port = args.port;
        var callback = args.callback;
        winston.debug(m.name + ' opened with ' + JSON.stringify(arguments));
        if (m.ports[port] && m.ports[port].devicetree) {
            var fragment = m.ports[port].devicetree;
            if (!is_capemgr()) {
                if (callback) callback({
                    err: 'Kernel does not include CapeMgr module'
                });
                return (false);
            }
            if (!load_dt(fragment)) {
                if (callback) callback({
                    'err': 'Devicetree overlay fragment ' +
                        fragment + ' not loaded'
                });
                return (false);
            }
        }
        m.openPorts[port] = m.doOpen(args);
        if (!m.openPorts[port]) {
            if (callback) callback({
                'err': 'Unable to ' + m.name
            });
            return (false);
        }
        for (var e in m.events) {
            var addHandler = function (m, port, e) {
                var handler = function () {
                    var myargs = arguments;
                    myargs.event = e;
                    for (var i = 0; i < arguments.length; i++) {
                        myargs[m.events[e][i]] = arguments[i];
                    }
                    callback(myargs);
                };
                m.openPorts[port].on(e, handler);
            };
            addHandler(m, port, e);
        }
        if (callback) callback({
            'event': 'return',
            'value': true
        });
        return (true);
    };
    newFunction.args = openArgs;
    return (newFunction);
};

var pin_data = function (slew, direction, pullup, mux) {
    var pinData = 0;
    if (slew == 'slow') pinData |= 0x40;
    if (direction != g.OUTPUT) pinData |= 0x20;
    switch (pullup) {
    case 'disabled':
        pinData |= 0x08;
        break;
    case 'pullup':
        pinData |= 0x10;
        break;
    default:
        break;
    }
    pinData |= (mux & 0x07);
    return (pinData);
};

// Inspired by
//   https://github.com/luciotato/waitfor/blob/master/waitfor.js
//   https://github.com/0ctave/node-sync/blob/master/lib/sync.js
var wait_for = function (fn, myargs, result_name, no_error) {
    var fiber = fibers.current;
    var yielded = false;
    var args = [];
    var result;

    for (var i in fn.args) {
        if (fn.args[i] == 'callback') {
            args.push(myCallback);
        } else {
            args.push(myargs[i]);
        }
    }

    if (typeof fiber == 'undefined') {
        if (no_error) {
            // No callback required (fire and forget)
            fn.apply(this, args);
        } else {
            var stack = new Error().stack;
            var err = 'As of BoneScript 0.2.5, synchronous calls must be made\n' +
                'within a fiber such as within loop() or setup():\n' + stack;
            winston.error(err);
            throw (err);
        }
    } else {
        fn.apply(this, args);
        if (!myCallback.called) {
            yielded = true;
            fibers.yield();
        }
    }

    function myCallback(x) {
        if (debug) winston.debug('Callback: ' + fn.name + ' ' + x.err);
        if (myCallback.called) return;
        if (typeof result_name == 'undefined') {
            result = x;
        } else if (typeof x[result_name] != 'undefined') {
            result = x[result_name];
        }
        if (typeof x.err != 'undefined' && x.err) {
            //var fn_name = fn.toString().substr('function '.length);
            //fn_name = fn_name.substr(0, fn_name.indexOf('('));
            if (debug) winston.debug(fn.name + ' ' + x.err);
        }
        myCallback.called = true;
        if (typeof fiber == 'undefined' && no_error) return;
        if (yielded) fiber.run();
    }

    return (result);
};

module.exports = {
    require: myRequire,
    is_new_capemgr: is_new_capemgr,
    is_capemgr: is_capemgr,
    is_ocp: is_ocp,
    is_cape_universal: is_cape_universal,
    find_sysfsFile: find_sysfsFile,
    file_exists: file_exists,
    file_existsSync: file_existsSync,
    file_find: file_find,
    load_dt: load_dt,
    create_dt: create_dt,
    myeval: myeval,
    getpin: getpin,
    wrapCall: wrapCall,
    wrapOpen: wrapOpen,
    pin_data: pin_data,
    wait_for: wait_for
}