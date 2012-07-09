var net = require('net');

var Server = net.Server.prototype;
var Pipe = process.binding('pipe_wrap').Pipe;

var oldListen = Server.listen;
Server.listen = function () {
    var self = this;

    if (arguments.length == 1 && arguments[0] == 'systemd') {
        if (!process.env.LISTEN_FDS || process.env.LISTEN_FDS != 1) {
            throw('No or too many file descriptors received.');
        }

        self._handle = new Pipe();
        self._handle.open(3);
        self._listen2(null, -1, -1);
    } else {
        oldListen.apply(self, arguments);
    }
}
