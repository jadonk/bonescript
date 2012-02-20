var bb = require('./bonescript');

setup = function() {
    var server = new bb.Server(8081, "bone101");
    server.begin();
};

bb.run();
