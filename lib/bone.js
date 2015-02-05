// Copyright (C) 2013 - Texas Instruments, Jason Kridner
//
// This is meant to hold some private functions
// Modified by Aditya Patadia, Octal Consulting LLP
var fs = require('fs');
var debug = require('debug')('bone');
var child_process = require('child_process');
var pinmap = require('./pinmap');
var g = require('./constants');
var verror = require("verror");
var exec = require('shelljs').exec;

var sysfsFiles = {};

function boneRequire(packageName, onfail) {
    var y = {};
    try {
        y = require(packageName);
        y.exists = true;
    } catch (ex) {
        y.exists = false;
        err = new verror("Optional package '%s' not loaded", packageName);
        console.error(error.message);
        if (onfail) onfail();
    }
    return (y);
}

module.exports = {

    require: boneRequire,

    getpin: function(pin) {
        if (typeof pin == 'object') return (pin);
        else if (typeof pin == 'string' && pinmap.pins[pin]) return (pinmap.pins[pin]);
        else if (typeof pin == 'number' && pinmap.pinIndex[pin]) return (pinmap.pinIndex[pin]);
        else throw new verror("Invalid pin: " + pin);
    },

    is_capemgr: function(callback) {
        return (module.exports.find_sysfsFile('capemgr', '/sys/devices', 'bone_capemgr.', callback));
    },

    is_ocp: function(callback) {
        return (module.exports.find_sysfsFile('ocp', '/sys/devices', 'ocp.', callback));
    },

    is_cape_universal: function(callback) {
        var ocp = module.exports.is_ocp();
        debug('is_ocp() = ' + ocp);
        var cape_universal = module.exports.find_sysfsFile('cape-universal', ocp, 'cape-universal.', callback);
        debug('is_cape_universal() = ' + cape_universal);
        return (cape_universal);
    },

    is_hdmi_enable: function() {
        var ocp = module.exports.is_ocp();
        return (module.exports.find_sysfsFile('hdmi', ocp, 'hdmi.'));
    },

    is_audio_enable: function() {
        var ocp = module.exports.is_ocp();
        return (module.exports.find_sysfsFile('sound', ocp, 'sound.'));
    },

    find_sysfsFile: function(name, path, prefix, callback) {
        if (typeof sysfsFiles[name] == 'undefined') {
            if (callback) {
                module.exports.file_find(path, prefix, onFindFile);
            } else {
                sysfsFiles[name] = module.exports.file_find(path, prefix);
            }
        } else {
            if (callback) callback(null, {
                path: sysfsFiles[name]
            });
        }

        function onFindFile(err, resp) {
            if (err) {
                callback(err, null);
            } else {
                sysfsFiles[name] = resp.path;
                callback(null, resp);
            }
        }

        return (sysfsFiles[name]);
    },

    file_find: function(path, prefix, callback) {
        var resp = {
            path: null
        };

        if (callback) {
            fs.readdir(path, onReadDir);
        } else {
            try {
                var files = fs.readdirSync(path);
                onReadDir(null, files);
            } catch (ex) {
                console.error('Error reading directory ' + path);
            }
            return (resp.path);
        }

        function onReadDir(err, files) {
            if (err) {
                err = verror(err, 'Error listing directory %s', path);
                if (callback) callback(err, null);
                return;
            }
            for (var j in files) {
                if (files[j].indexOf(prefix) === 0) {
                    resp.path = path + '/' + files[j];
                    if (callback) callback(null, resp);
                    return;
                }
            }
            if (resp.path === null && callback) {
                callback(null, resp);
            }
        }
    },

    create_dt_sync: function(template, load, force_create) {
        debug('create_dt_sync(' + [template, load, force_create] + ')');
        load = (typeof load === 'undefined') ? true : load;
        var dtsFilename = '/lib/firmware/' + template + '-00A0.dts';
        var dtboFilename = '/lib/firmware/' + template + '-00A0.dtbo';

        if (force_create) {
            createDTS();
        } else {
            var exists = fs.existsSync(dtboFilename);
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
            var templateFilename = require.resolve('octalbonescript').replace('index.js',
                'dts/' + template + '_template.dts');
            debug('Copying template: ' + templateFilename);
            var dts = fs.readFileSync(templateFilename, 'utf8');
            try {
                fs.writeFileSync(dtsFilename, dts, 'ascii');
            } catch (ex) {
                throw new verror(ex, 'Error writing  %s', dtsFilename);
            }
            onDTSWrite();
        }

        function onDTSWrite() {
            debug('Compiling dts file');
            var command = 'dtc -O dtb -o ' + dtboFilename + ' -b 0 -@ ' + dtsFilename;

            var result = exec(command);
            if (result.code !== 0) {
                throw new verror(result.output, " Compiling of dts file failed.");
            }

            onDTBOExists();
        }

        function onDTBOExists() {
            debug('onDTBOExists()');
            if (load) module.exports.load_dt_sync(template);
        }
        return true;
    },

    // Note, this just makes sure there was an attempt to load the
    // devicetree fragment, not if it was successful

    load_dt_sync: function(name) {
        debug('load_dt_sync(' + [name] + ')');
        var slotsFile;
        var err;
        var readAttempts = 0;

        var capemgr = module.exports.is_capemgr();
        onFindCapeMgr({
            path: capemgr
        });

        function onFindCapeMgr(x) {
            debug('onFindCapeMgr: path = ' + x.path);
            if (typeof x.path == 'undefined') {
                throw new verror("CapeMgr not found ");
            }
            slotsFile = x.path + '/slots';
            readSlots();
        }

        function readSlots() {
            var slots;
            try {
                slots = fs.readFileSync(slotsFile, 'ascii');
            } catch (ex) {
                err = ex;
            }
            onReadSlots(err, slots);
        }

        function onReadSlots(err, slots) {
            readAttempts++;
            if (err) {
                throw new verror(err, 'Unable to read from CapeMgr slots');
            }
            var index = slots.indexOf(name);
            debug('onReadSlots: index = ' + index + ', readAttempts = ' + readAttempts);
            if (index >= 0) {
                debug(name + " is successfully loaded"); // do nothing...
            } else if (readAttempts <= 1) {
                // Attempt to load fragment
                try {
                    debug('Writing ' + name + ' to ' + slotsFile);
                    fs.writeFileSync(slotsFile, name, 'ascii');
                } catch (ex) {
                    err = ex;
                }
                onWriteSlots(err);
            } else {
                err = 'Error waiting for CapeMgr slot to load';
                throw new verror(err);
            }
        }

        function onWriteSlots(err) {
            if (err) {
                throw new verror(err, 'Write to CapeMgr slots failed');
            }
            readSlots();
        }

        debug('load_dt_sync resp: ' + JSON.stringify(resp));
        debug('load_dt_sync return: ' + (typeof resp.err == 'undefined'));
        return true;
    },

    wrapCall: function(m, func, funcArgs, cbArgs) {
        if (!m.module.exists) {
            debug(m.name + ' support module not loaded.');
            return (function() {});
        }
        funcArgs.unshift('port');
        funcArgs.push('callback');
        var newFunction = function() {
            var args = [];
            var port = arguments[0];
            var callback = false;
            for (var i = 1; i < arguments.length; i++) {
                debug('Adding argument ' + funcArgs[i] + ' to wrapper');
                if (funcArgs[i] == 'callback') {
                    callback = arguments[i];
                    var wrappedCallback = function() {
                        var cbData = {};
                        for (var j = 0; j < cbArgs.length; j++) {
                            cbData[cbArgs[j]] = arguments[j];
                        }
                        cbData.event = 'callback';
                        debug('cbData = ' + JSON.stringify(cbData));
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
            debug('Calling ' + m.name + '[' + port + '].' + func + '(' + args + ')');
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
    },

    wrapOpen: function(m, openArgs) {
        if (!m.module.exists) {
            debug(m.name + ' support module not loaded.');
            return (function() {});
        }
        openArgs.unshift('port');
        openArgs.push('callback');
        var newFunction = function() {
            var args = {};
            for (var i = 0; i < openArgs.length; i++) {
                args[openArgs[i]] = arguments[i];
            }
            var port = args.port;
            var callback = args.callback;
            debug(m.name + ' opened with ' + JSON.stringify(arguments));
            if (m.ports[port] && m.ports[port].devicetree) {
                var fragment = m.ports[port].devicetree;
                if (!module.exports.is_capemgr()) {
                    if (callback) callback({
                        err: 'Kernel does not include CapeMgr module'
                    });
                    return (false);
                }
                if (!module.exports.load_dt(fragment)) {
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
                var addHandler = function(m, port, e) {
                    var handler = function() {
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
    },

    /* this is async code for loading capes. Can be removed at later stage

    create_dt : function(pin, data, template, load, force_create, resp, callback) {
        debug('create_dt(' + [pin.key, data, template, load, force_create, JSON.stringify(resp)] + ')');
        
        template = template || 'bspm';
        load = (typeof load === 'undefined') ? true : load;
        var fragment = template;
        var dtsFilename = '/lib/firmware/' + fragment + '-00A0.dts';
        var dtboFilename = '/lib/firmware/' + fragment + '-00A0.dtbo';
        
        if(force_create) {
            createDTS();
        } else {
            fs.exists(dtboFilename, onDTBOExistsTest);
        }
        
        function onDTBOExistsTest(exists) {
            if(exists) {
                onDTBOExists();
            } else {
                createDTS();
            }
        }

        function createDTS() {
            var templateFilename = require.resolve('octalbonescript').replace('index.js',
                'dts/' + template + '_template.dts');
            debug('Creating template: ' + templateFilename);
            var dts = fs.readFileSync(templateFilename, 'utf8');
            dts = dts.replace(/!PIN_KEY!/g, pin.key);
            dts = dts.replace(/!PIN_DOT_KEY!/g, pin.key.replace(/_/, '.'));
            dts = dts.replace(/!PIN_FUNCTION!/g, pin.options[data&7]);
            dts = dts.replace(/!PIN_OFFSET!/g, pin.muxRegOffset);
            dts = dts.replace(/!DATA!/g, '0x' + data.toString(16));
            if(pin.pwm) {
                dts = dts.replace(/!PWM_MODULE!/g, pin.pwm.module);
                dts = dts.replace(/!PWM_INDEX!/g, pin.pwm.index);
                dts = dts.replace(/!DUTY_CYCLE!/g, 500000);
            }
            fs.writeFile(dtsFilename, dts, 'ascii', onDTSWrite);
        }
        
        function onDTSWrite(err) {
            if(err) {
                resp.err = 'Error writing ' + dtsFilename + ': ' + err;
                debug(resp.err);
                callback(resp);
                return;
            }
            var command = 'dtc -O dtb -o ' + dtboFilename + ' -b 0 -@ ' + dtsFilename;
            child_process.exec(command, dtcHandler);
        }
        
        function dtcHandler(error, stdout, stderr) {
            debug('dtcHandler: ' +
                JSON.stringify({error:error, stdout:stdout, stderr:stderr}));
            if(!error) onDTBOExists();
        }
        
        function onDTBOExists() {
            debug('onDTBOExists()');
            if(load) module.exports.load_dt(fragment, pin, resp, callback);
            else callback(resp);
        }
    },

    load_dt : function(name, pin, resp, callback) {
        debug('load_dt(' + [name, pin ? pin.key : null, JSON.stringify(resp)] + ')');
        resp = resp || {};
        var slotsFile;
        var lastSlots;
        var writeAttempts = 0;
        var readAttempts = 0;
        if(pin) {
            var slotRegex = new RegExp('\\d+(?=\\s*:.*,bs.*' + pin.key + ')', 'gm');
        }
        module.exports.is_capemgr(onFindCapeMgr);
        
        function onFindCapeMgr(x) {
            debug('onFindCapeMgr: path = ' + x.path);
            if(typeof x.path == 'undefined') {
                resp.err = "CapeMgr not found: " + x.err;
                console.error(resp.err);
                callback(resp);
                return false;
            }
            slotsFile = x.path + '/slots';
            fs.readFile(slotsFile, 'ascii', onReadSlots);
        }
        
        function onReadSlots(err, slots) {
            readAttempts++;
            if(err) {
                resp.err = 'Unable to read from CapeMgr slots: ' + err;
                console.error(resp.err);
                callback(resp);
                return false;
            }
            lastSlots = slots;
            var index = slots.indexOf(name);
            debug('onReadSlots: index = ' + index + ', readAttempts = ' + readAttempts);
            if(index >= 0) {
                // Fragment is already loaded
                if(typeof callback == 'function') callback(resp);
                return true;
            } else if (readAttempts <= 1) {
                // Attempt to load fragment
                fs.writeFile(slotsFile, name, 'ascii', onWriteSlots);
            } else {
                resp.err = 'Error waiting for CapeMgr slot to load';
                if(typeof callback == 'function') callback(resp);
            }
        }
        
        function onWriteSlots(err) {
            writeAttempts++;
            if(err) {
                resp.err = 'Write to CapeMgr slots failed: ' + err;
                if(pin && writeAttempts <= 1) unloadSlot();
                else callback(resp);
                return false;
            }
            setTimeout(function(){ //give some time to load slots after updating slots file.
                fs.readFile(slotsFile, 'ascii', onReadSlots);
            },100);
        }
        
        function unloadSlot() {
            debug('unloadSlot()');
            var slot = lastSlots.match(slotRegex);
            if(slot && slot[0]) {
                debug('Attempting to unload conflicting slot ' +
                    slot[0] + ' for ' + name);
                debug('Actually did not attempt because of kernel panic problem');
                //fs.writeFile(slotsFile, '-'+slot[0], 'ascii', onUnloadSlot);
                // above line is commented because kernel panic is there when slot is unloaded.
                onUnloadSlot(null);
            } else {
                if(typeof callback =='function') callback(resp);
            }
        }

        function onUnloadSlot(err) {
            if(err) {
                resp.err = "Unable to unload conflicting slot: " + err;
                if(typeof callback =='function') callback(resp);
                return false;
            }
            fs.writeFile(slotsFile, name, 'ascii', onWriteSlots);
        }
    }

    */

};