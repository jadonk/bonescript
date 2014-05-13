// Copyright (C) 2013 - Texas Instruments, Jason Kridner
//
// This is meant to hold some private functions
//
var fs = require('fs');
var winston = require('winston');
var child_process = require('child_process');
var ffi = require('ffi');
var bone = require('./bone');
var g = require('./constants');
var debug = process.env.DEBUG ? true : false;
var sysfsFiles = {};

exports.require = function(packageName, onfail) {
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
};

var fibers = exports.require('fibers');

var libc = new ffi.Library(null, {
    "system": ["int32", ["string"]]
});

exports.execSync = function(cmd) {
    var retval = libc.system(cmd);
    return(retval);
};

exports.is_capemgr = function(callback) {
    return(exports.find_sysfsFile('capemgr', '/sys/devices', 'bone_capemgr.', callback));
};

exports.is_ocp = function(callback) {
    return(exports.find_sysfsFile('ocp', '/sys/devices', 'ocp.', callback));
};

exports.find_sysfsFile = function(name, path, prefix, callback) {
    if(typeof sysfsFiles[name] == 'undefined') {
        if(callback) {
            sysfsFiles[name] = exports.file_find(path, prefix, 1, onFindCapeMgr);
        } else {
            sysfsFiles[name] = exports.file_find(path, prefix, 1);
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
};

exports.file_exists = fs.exists;
exports.file_existsSync = fs.existsSync;
if(typeof exports.file_exists == 'undefined') {
    var path = require('path');
    exports.file_exists = path.exists;
    exports.file_existsSync = path.existsSync;
}

exports.file_find = function(path, prefix, attempts, callback) {
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
    
    return(resp);
};

exports.myeval = function(x) {
    winston.debug('myeval("' + x + '");');
    var y;
    try {
        y = eval(x);
    } catch(ex) {
        y = undefined;
        winston.error('myeval error: ' + ex);
        throw('myeval error: ' + ex);
    }
    winston.debug('result = ' + y);
    return(y);
};

exports.getpin = function(pin) {
    if(typeof pin == 'object') return(pin);
    else if(typeof pin == 'string') return(bone.pins[pin]);
    else if(typeof pin == 'number') return(bone.pinIndex[pin]);
    else throw("Invalid pin: " + pin);
};

exports.wrapCall = function(m, func, funcArgs, cbArgs) {
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
};

exports.wrapOpen = function(m, openArgs) {
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
            if(!exports.is_capemgr()) {
                if(callback) callback({err:'Kernel does not include CapeMgr module'});
                return(false);
            }
            if(!exports.load_dt(fragment)) {
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
};

exports.pin_data = function(slew, direction, pullup, mux) {
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
};

exports.get_args = function(myargs, fn) {
    return(args);
};

exports.print_call = function(fnName, args) {
    if(debug) {
        var myargs = [];
        for(var i in args) {
            if(i == 'pin') {
                myargs[i] = exports.getpin(args[i]).key;
            } else if(typeof args[i] === typeof function(){}) {
                myargs[i] = 'function';
            } else if(typeof args[i] === typeof {}) {
                myargs[i] = JSON.stringify(args[i]);
            } else {
                myargs[i] = args[i];
            }
        }
        winston.debug(fnName + '(' + myargs + ');');
    }
};

exports.run_sync = function run_sync(fns, fnName, state) {
    for(var i = 0; i < fns.length; i++) {
        if(typeof f[fnName].fns[i] == typeof []) {
            state = run_sync(fns[i], fnName + '.' + i, state);
        } else {
            state = fns[i](state);
        }
        if(state.err || state.done) {
            if(state.err && debug) winston.debug(fnName + '[' + i + '].sync(): ' + JSON.stringify(state));
            return(state);
        }
    }
    return(state);
};

exports.run_async = function(fns, fnName, callback, state) {
    var i = -1;
    mycallback(state);

    function mycallback(state) {
        if(state.err || state.done) {
            if(state.err && debug) winston.debug(fnName + '[' + i + '].async(): ' + JSON.stringify(state));
            finalize(state);
            return;
        }

        i++;
        if(fns.length > i) {
            if(typeof fns[i] == typeof []) {
                run_async(fns[i], fnName + '.' + i, state, mycallback);
            } else {
                fns[i](state, mycallback);
            }
        } else {
            finalize(state);
        }
    }

    function finalize(state) {
        callback(state);
    }
};

exports.run_per_pin = function(myfunc, state, callback) {
    var pins = state.args.pin;
    if(typeof pins == typeof []) {
        if(callback) {
            run_next();
        } else {
            for(var pin in pins) {
                state = myfunc(pins[pin], state);
            }
        }
    } else {
        state = myfunc(state.args.pin, state, callback);
    }

    function run_next(state) {
        if(state.err) {
            callback(state);
            return;
        }
        var pin = pins.unshift();
        if(pin) {
            myfunc(pin, state, run_next);
        } else {
            callback(state);
        }
    }

    return(state);
};
