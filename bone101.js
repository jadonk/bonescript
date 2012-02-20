var bb = require('./bonescript');

setup = function() {
    var server = new bb.Server(80, "bone101");
    server.begin();
};

bb.run();
