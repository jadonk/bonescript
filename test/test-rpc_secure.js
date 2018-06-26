var server = require('../src/server');
var bonescript = require('../src/bonescript');
var myserver = null;

exports.setUp = function (callback) {
    server.serverStart(8000, process.cwd(), { // create a secure server by supplying credentials
        username: 'testuser',
        password: 'testpass'
    }, mycb);

    function mycb(serverobj) {
        myserver = serverobj.server;
        callback();
    }
};

exports.testRPC_secure1 = function (test) {
    test.expect(1);
    bonescript.startClient({ // this should throw an  authentication error
        address: '127.0.0.1',
        port: 8000
    }, function () {});
    process.on('uncaughtException', function (err) {
        console.log(err.toString());
        test.equals(err.toString(), 'Error: user not logged in!!check username or password');
        myserver.close();
        test.done();
    });
}

exports.testRPC_secure2 = function (test) {
    test.expect(1);
    bonescript.startClient({
        address: '127.0.0.1',
        port: 8000,
        username: 'testuser',
        password: 'testpass' // will not throw any error
    }, function () {
        var b = bonescript.require('bonescript');
        b.getPlatform(function (platform) {
            console.log('Name: ' + platform.name);
            console.log('Version: ' + platform.bonescript);
            test.ok(platform != 'undefined');
            myserver.close();
            test.done();
        });
    });
}