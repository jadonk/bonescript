var _bonescript = {};
_bonescript.modules = {};
_bonescript._callbacks = {};
_bonescript._seqnum = 0;
_bonescript.on = {};
_bonescript.on.connect = function () {};
_bonescript.on.connecting = function () {};
_bonescript.on.disconnect = function () {};
_bonescript.on.connect_failed = function () {};
_bonescript.on.error = function (err) {
    throw (new Error(err))
};
_bonescript.on.reconnect = function () {};
_bonescript.on.reconnect_failed = function () {};
_bonescript.on.reconnecting = function () {};
_bonescript.on.initialized = function () {};

(function () {
    if (typeof document == 'undefined') {
        var io = require('socket.io-client');
        var crypto = require('crypto');
        module.exports.startClient = function (host, callback) {
            var passphrase_hash;
            if (host.password)
                passphrase_hash = crypto.createHash('sha256').update(host.password).digest("hex"); //generate sha256 hash for supplied password
            _bonescript.on.initialized = callback;
            var socket = _onSocketIOLoaded(host.address, host.port, io, passphrase_hash);
        }
        return;
    }
    require = myrequire;
    var head = document.getElementsByTagName('head')[0];
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = '___INSERT_HOST___/socket.io/socket.io.js';
    script.charset = 'UTF-8';
    var scriptObj = head.appendChild(script);
    scriptObj.onload = _onSocketIOLoaded;
}());

function _onSocketIOLoaded(host, port, socketio, passphrase_hash) {
    //console.log("socket.io loaded");
    if (typeof host == 'undefined') host = '___INSERT_HOST___';
    if (typeof port == 'undefined') port = 80;
    if (typeof socketio == 'undefined' && typeof io != 'undefined') socketio = io;
    var socket;
    if (typeof host == 'string')
        socket = socketio('http://' + host + ':' + port, {
            extraHeaders: {
                'Authorization': typeof passphrase_hash != 'undefined' ? passphrase_hash : null //send passphrase_has as Authorization extraheader
            }
        });
    else
        socket = socketio('___INSERT_HOST___', {
            port: port
        });
    socket.on('require', getRequireData);
    socket.on('bonescript', _seqcall);
    socket.on('connect', _bonescript.on.connect);
    socket.on('connecting', _bonescript.on.connecting);
    socket.on('disconnect', _bonescript.on.disconnect);
    socket.on('connect_failed', _bonescript.on.connect_failed);
    socket.on('error', _bonescript.on.error);
    socket.on('reconnect', _bonescript.on.reconnect);
    socket.on('reconnect_failed', _bonescript.on.reconnect_failed);
    socket.on('reconnecting', _bonescript.on.reconnecting);
    socket.on('initialized', _bonescript.on.initialized);

    function getRequireData(m) {
        if (!m.module || !m.data)
            throw ('Invalid "require" message sent for "' + m.module + '"');
        //console.log('Initialized module: ' + m.module);
        _bonescript.modules[m.module] = {};
        for (var x in m.data) {
            if (!m.data[x].type || !m.data[x].name || (typeof m.data[x].value == 'undefined'))
                throw ('Invalid data in "require" message sent for "' + m.module + '.' + m.data[x] + '"');
            if (m.data[x].type == 'function') {
                // define the function
                if (!m.data[x].value)
                    throw ('Missing args in "require" message sent for "' + m.module + '.' + m.data[x] + '"');
                var myargs = m.data[x].value;

                // eval of objString builds the call data out of arguments passed in
                var objString = '';
                for (var y in myargs) {
                    if (isNaN(y)) continue; // Need to find the source of this bug
                    if (myargs[y] == 'callback') continue;
                    objString += ' if(typeof ' + myargs[y] + ' == "function") {\n';
                    objString += '  ' + myargs[y] + ' = ' + myargs[y] + '.toString();\n';
                    objString += ' }\n';
                    objString += ' calldata.' + myargs[y] + ' = ' + myargs[y] + ';\n';
                }
                var argsString = myargs.join(', ');
                var handyfunc = '_bonescript.modules["' + m.module + '"].' + m.data[x].name +
                    ' = ' +
                    'function (' + argsString + ') {\n' +
                    ' var calldata = {};\n' +
                    objString +
                    ' if(callback) {\n' +
                    '  _bonescript._callbacks[_bonescript._seqnum] = callback;\n' +
                    '  calldata.seq = _bonescript._seqnum;\n' +
                    '  calldata.length = callback.length;\n' +
                    '  _bonescript._seqnum++;\n' +
                    ' }\n' +
                    ' socket.emit("' + m.module + '$' + m.data[x].name + '", calldata);\n' +
                    '};\n';
                eval(handyfunc);
            } else {
                _bonescript.modules[m.module][m.data[x].name] = m.data[x].value;
            }
        }
        _bonescript.modules[m.module].socket = socket;
        _bonescript.on.initialized();
    }

    return (socket);
}

function _seqcall(data) {
    if ((typeof data.seq != 'number') || (typeof _bonescript._callbacks[data.seq] != 'function'))
        throw "Invalid callback message received: " + JSON.stringify(data);
    if (_bonescript._callbacks[data.seq].length == 1)
        _bonescript._callbacks[data.seq](data);
    else
        _bonescript._callbacks[data.seq](data.err, data.resp);
    if (data.oneshot) delete _bonescript._callbacks[data.seq];
}

// Require must be synchronous to be able to return data structures and
// functions and therefore cannot call socket.io. All exported modules must
// be exported ahead of time.
function myrequire(module) {
    if (typeof _bonescript == 'undefined')
        throw 'No BoneScript modules are not currently available';
    if (typeof _bonescript.modules[module] == 'undefined')
        throw 'Module "' + module + '" is not currently available';
    return (_bonescript.modules[module]);
}

if (typeof module != 'undefined') {
    module.exports.require = myrequire;
}