var bb = require('./bonescript');

setup = function() {
    var server = new bb.Server(80, "bone101");
    server.begin();
};

loop = function() {
};

bb.run();
