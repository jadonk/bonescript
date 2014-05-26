// Copyright (C) 2013 - Texas Instruments, Jason Kridner
//
// This is meant to hold some private functions
// Modified by Aditya Patadia, Octal Consulting LLP
var fs = require('fs');
var winston = require('winston');
var child_process = require('child_process');
var bone = require('./bone');
var g = require('./constants');

var debug;
if(process.env.DEBUG && process.env.DEBUG.indexOf("bone")!==-1){
    debug = true;
} else {
    debug = false;
}

var sysfsFiles = {};

function myRequire(packageName, onfail) {
    var y = {};
    try {
        y = require(packageName);
        y.exists = true;
    } catch(ex) {
        y.exists = false;
        if(debug) winston.debug("Optional package '" + packageName + "' not loaded");
        if(onfail) onfail();
    }
    return(y);
}

var fibers = myRequire("fibers");

module.exports = {

    require : myRequire,

    is_capemgr : function(callback) {
        return(module.exports.find_sysfsFile('capemgr', '/sys/devices', 'bone_capemgr.', callback));
    },

    is_ocp : function(callback) {
        return(module.exports.find_sysfsFile('ocp', '/sys/devices', 'ocp.', callback));
    },

    find_sysfsFile : function(name, path, prefix, callback) {
        if(typeof sysfsFiles[name] == 'undefined') {
            if(callback) {
                sysfsFiles[name] = module.exports.file_find(path, prefix, 1, onFindCapeMgr);
            } else {
                sysfsFiles[name] = module.exports.file_find(path, prefix, 1);
            }
        } else {
            if(callback) callback({path: sysfsFiles[name]});
        }
        
        function onFindCapeMgr(resp) {
            if(typeof resp.path == 'undefined') sysfsFiles[name] = false;
            else sysfsFiles[name] = resp.path;
            callback(resp);
        }
        
        return(sysfsFiles[name]);
    },

    file_exists : fs.exists,

    file_existsSync : fs.existsSync,

    file_find : function(path, prefix, attempts, callback) {
        var resp = {};
        resp.attempts = 0;
        if(typeof attempts == 'undefined') attempts = 1;
        
        if(callback) {
            fs.readdir(path, onReadDir);
        } else {
            while(resp.attempts < attempts) {
                try {
                    var files = fs.readdirSync(path);
                    onReadDir(null, files);
                } catch(ex) {
                    if(debug) winston.debug('Error reading ' + path);
                    return(resp.path);
                    
                }
                if(resp.path) return(resp.path);
            }
            return(resp.path);
        }
        
        function onReadDir(err, files) {
            resp.attempts++;
            if(err) {
                resp.err = 'Error listing directory ' + path + ': ' + err;
                if(callback) callback(resp);
                return;
            }
            for(var j in files) {
                if(files[j].indexOf(prefix) === 0) {
                    resp.path = path + '/' + files[j];
                    if(callback) callback(resp);
                    return;
                }
            }
            if(callback) {
                if(resp.attempts >= attempts) {
                    resp.err = 'Did not find ' + prefix + ' in ' + path;
                    callback(resp);
                } else {
                    fs.readdir(path, onReadDir);
                }
            }
        }
        
        return(resp.path);
    },

    // Note, this just makes sure there was an attempt to load the
    // devicetree fragment, not if it was successful
    load_dt : function(name, pin, resp, callback) {
        if(debug) {
            if(pin){
                winston.debug('load_dt(' + [name, pin.key, JSON.stringify(resp)] + ')');
            } else {
                winston.debug('load_dt(' + [name, JSON.stringify(resp)] + ')');
            }
        }
        var slotsFile;
        var lastSlots;
        var writeAttempts = 0;
        var readAttempts = 0;
        if(pin) {
            var slotRegex = new RegExp('\\d+(?=\\s*:.*,bs.*' + pin.key + ')', 'gm');
        }
        module.exports.is_capemgr(onFindCapeMgr);
        
        function onFindCapeMgr(x) {
            if(debug) winston.debug('onFindCapeMgr: path = ' + x.path);
            if(typeof x.path == 'undefined') {
                resp.err = "CapeMgr not found: " + x.err;
                winston.error(resp.err);
                callback(resp);
                return;
            }
            slotsFile = x.path + '/slots';
            fs.readFile(slotsFile, 'ascii', onReadSlots);
        }
        
        function onReadSlots(err, slots) {
            readAttempts++;
            if(err) {
                resp.err = 'Unable to read from CapeMgr slots: ' + err;
                winston.error(resp.err);
                callback(resp);
                return;
            }
            lastSlots = slots;
            var index = slots.indexOf(name);
            if(debug) winston.debug('onReadSlots: index = ' + index + ', readAttempts = ' + readAttempts);
            if(index >= 0) {
                // Fragment is already loaded
                callback(resp);
            } else if (readAttempts <= 1) {
                // Attempt to load fragment
                fs.writeFile(slotsFile, name, 'ascii', onWriteSlots);
            } else {
                resp.err = 'Error waiting for CapeMgr slot to load';
                callback(resp);
            }
        }
        
        function onWriteSlots(err) {
            writeAttempts++;
            if(err) {
                resp.err = 'Write to CapeMgr slots failed: ' + err;
                if(pin && writeAttempts <= 1) unloadSlot();
                else callback(resp);
                return;
            }
            fs.readFile(slotsFile, 'ascii', onReadSlots);
        }
        
        function unloadSlot() {
            var slot = lastSlots.match(slotRegex);
            if(slot && slot[0]) {
                if(debug) winston.debug('Attempting to unload conflicting slot ' +
                    slot[0] + ' for ' + name);
                fs.writeFile(slotsFile, '-'+slot[0], 'ascii', onUnloadSlot);
            } else {
                callback(resp);
            }
        }

        function onUnloadSlot(err) {
            if(err) {
                resp.err = "Unable to unload conflicting slot: " + err;
                callback(resp);
                return;
            }
            fs.writeFile(slotsFile, name, 'ascii', onWriteSlots);
        }
    },

    create_dt : function(pin, data, template, load, force_create, resp, callback) {
        if(debug){
            winston.debug('create_dt(' + [pin.key, data, template, load, force_create, JSON.stringify(resp)] + ')');
        }
        template = template || 'bspm';
        load = (typeof load === 'undefined') ? true : load;
        var fragment = template + '_' + pin.key + '_' + data.toString(16);
        var dtsFilename = '/lib/firmware/' + fragment + '-00A0.dts';
        var dtboFilename = '/lib/firmware/' + fragment + '-00A0.dtbo';
        
        if(force_create) {
            createDTS();
        } else {
            module.exports.file_exists(dtboFilename, onDTBOExistsTest);
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
            if(debug) winston.debug('Creating template: ' + templateFilename);
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
                if(debug) winston.debug(resp.err);
                callback(resp);
                return;
            }
            var command = 'dtc -O dtb -o ' + dtboFilename + ' -b 0 -@ ' + dtsFilename;
            child_process.exec(command, dtcHandler);
        }
        
        function dtcHandler(error, stdout, stderr) {
            if(debug) winston.debug('dtcHandler: ' +
                JSON.stringify({error:error, stdout:stdout, stderr:stderr}));
            if(!error) onDTBOExists();
        }
        
        function onDTBOExists() {
            if(debug) winston.debug('onDTBOExists()');
            if(load) module.exports.load_dt(fragment, pin, resp, callback);
            else callback(resp);
        }
    },

    getpin : function(pin) {
        if(typeof pin == 'object') return(pin);
        else if(typeof pin == 'string') return(bone.pins[pin]);
        else if(typeof pin == 'number') return(bone.pinIndex[pin]);
        else throw("Invalid pin: " + pin);
    },

    wrapCall : function(m, func, funcArgs, cbArgs) {
        if(!m.module.exists) {
            if(debug) winston.debug(m.name + ' support module not loaded.');
            return(function(){});
        }
        funcArgs.unshift('port');
        funcArgs.push('callback');
        var newFunction = function() {
            var args = [];
            var port = arguments[0];
            var callback = false;
            for(var i = 1; i < arguments.length; i++) {
                winston.debug('Adding argument ' + funcArgs[i] + ' to wrapper');
                if(funcArgs[i] == 'callback') {
                    callback = arguments[i];
                    var wrappedCallback = function() {
                        var cbData = {};
                        for(var j = 0; j < cbArgs.length; j++) {
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
            if(!m.openPorts[port]) {
                if(callback) callback({'err': m.name + ' ' + port + ' not opened'});
                return(false);
            }
            winston.debug('Calling ' + m.name + '[' + port + '].' + func + '(' + args + ')');
            var x = m.openPorts[port][func].apply(
                    m.openPorts[port], args);
            if(callback) callback({'event': 'return', 'return': x});
            return(x);
        };
        newFunction.args = funcArgs;
        return(newFunction);
    },

    wrapOpen : function(m, openArgs) {
        if(!m.module.exists) {
            if(debug) winston.debug(m.name + ' support module not loaded.');
            return(function(){});
        }
        openArgs.unshift('port');
        openArgs.push('callback');
        var newFunction = function() {
            var args = {};
            for(var i = 0; i < openArgs.length; i++) {
                args[openArgs[i]] = arguments[i];
            }
            var port = args.port;
            var callback = args.callback;
            winston.debug(m.name + ' opened with ' + JSON.stringify(arguments));
            if(m.ports[port] && m.ports[port].devicetree) {
                var fragment = m.ports[port].devicetree;
                if(!module.exports.is_capemgr()) {
                    if(callback) callback({err:'Kernel does not include CapeMgr module'});
                    return(false);
                }
                if(!module.exports.load_dt(fragment)) {
                    if(callback) callback({'err': 'Devicetree overlay fragment ' +
                        fragment + ' not loaded'});
                    return(false);
                }
            }
            m.openPorts[port] = m.doOpen(args);
            if(!m.openPorts[port]) {
                if(callback) callback({'err': 'Unable to ' + m.name});
                return(false);
            }
            for(var e in m.events) {
                var addHandler = function(m, port, e) {
                    var handler = function() {
                        var myargs = arguments;
                        myargs.event = e;
                        for(var i = 0; i < arguments.length; i++) {
                            myargs[m.events[e][i]] = arguments[i];
                        }
                        callback(myargs);
                    };
                    m.openPorts[port].on(e, handler);
                };
                addHandler(m, port, e);
            }
            if(callback) callback({'event':'return', 'value':true});
            return(true);
        };
        newFunction.args = openArgs;
        return(newFunction);
    },

    pin_data : function(slew, direction, pullup, mux) {
        var pinData = 0;
        if(slew == 'slow') pinData |= 0x40;
        if(direction != g.OUTPUT) pinData |= 0x20;
        switch(pullup) {
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
        return(pinData);
    },

    // Inspired by
    //   https://github.com/luciotato/waitfor/blob/master/waitfor.js
    //   https://github.com/0ctave/node-sync/blob/master/lib/sync.js
    wait_for : function(fn, myargs, result_name, no_error) {
        var fiber = fibers.current;
        var yielded = false;
        var args = [];
        var result;

        for(var i in fn.args) {
            if(fn.args[i] == 'callback') {
                args.push(myCallback);
            } else {
                args.push(myargs[i]);
            }
        }

        if(typeof fiber == 'undefined') {
            if(no_error) {
                // No callback required (fire and forget)
                fn.apply(this, args);
            } else {
                var stack = new Error().stack;
                var err = 'As of BoneScript 0.2.5, synchronous calls must be made\n' +
                    'within a fiber such as within loop() or setup():\n' + stack;
                winston.error(err);
                throw(err);
            }
        } else {
            fn.apply(this, args);
            if(!myCallback.called) {
                yielded = true;
                fibers.yield();
            }
        }
        
        function myCallback(x) {
            if(debug) winston.debug('Callback: ' + fn.name + ' ' + x.err);
            if(myCallback.called) return;
            if(typeof result_name == 'undefined') {
                result = x;
            } else if(typeof x[result_name] != 'undefined') {
                result = x[result_name];
            }
            if(typeof x.err != 'undefined' && x.err) {
                //var fn_name = fn.toString().substr('function '.length);
                //fn_name = fn_name.substr(0, fn_name.indexOf('('));
                if(debug) winston.debug(fn.name + ' ' + x.err);
            }
            myCallback.called = true;
            if(typeof fiber == 'undefined' && no_error) return;
            if(yielded) fiber.run();
        }
        
        return(result);
    }
};

