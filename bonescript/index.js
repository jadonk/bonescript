// Copyright (C) 2011 - Texas Instruments, Jason Kridner 
//
// 
var fs = require('fs');
var child_process = require('child_process');
var http = require('http');
var url = require('url');
var path = require('path');
var events = require('events');
bone = require('./bone').bone;

var myrequire = function(packageName, onfail) {
    var y = {};
    try {
        y = require(packageName);
        y.exists = true;
    } catch(ex) {
        y.exists = false;
        console.log("'" + packageName + "' not loaded");
        console.log("If desired, try installing it with:");
        console.log("  curl http://npmjs.org/install.sh | bash");
        console.log("  npm install " + packageName);
        onfail();
    }
    return(y);
};

var socket = myrequire('socket.io', function() {
    console.log("Dynamic web features not enabled");
});

var binary = myrequire('binary', function() { });
var inotify = myrequire('inotify', function() { });

var fibers = myrequire('fibers', function() {
    console.log("Delay operations loops will consume CPU cycles");
    console.log("Invoke using 'node-fibers' if node version < 0.5.2");
});

OUTPUT = exports.OUTPUT = "out";
INPUT = exports.INPUT = "in";
HIGH = exports.HIGH = 1;
LOW = exports.LOW = 0;

var gpio = [];

pinMode = exports.pinMode = function(pin, mode)
{
    var n = pin.gpio;
    
    if(!gpio[n] || !gpio[n].path) {
        gpio[n] = {};
        
        // Ensure the pin is in GPIO mode
        if(pin.mux) {
            try {
                var muxfile = fs.openSync(
                    "/sys/kernel/debug/omap_mux/" + pin.mux, "w"
                );
                fs.writeSync(muxfile, "7", null);
            } catch(ex3) {  
                console.log("" + ex3);
                console.log("Unable to configure pinmux for: " + pin.name +
                    " (" + pin.mux + ")");
                console.log("Trying: mount -t debugfs none /sys/kernel/debug");
                //var state = 
                //    fs.readFileSync("/sys/kernel/debug/omap_mux/" + pin.mux);
                //console.log("pinmux state: ");
                //console.log("" + state);
                
                // Configure the pinmux later once mount has run
                child_process.exec("mount -t debugfs none /sys/kernel/debug",
                    function(error, stderr, stdout) {
                        var muxfile = fs.writeFile(
                            "/sys/kernel/debug/omap_mux/" + pin.mux, "7"
                        );
                    }
                );
            }
        }
        
        // Export the GPIO controls
        try {
            try {
                fs.writeFileSync("/sys/class/gpio/export", "" + n);
            } catch(ex2) {
                // TODO: If the file is already exported, can we know who did
                // did it so that we aren't opening it twice?  In general, this
                // shouldn't be an error until we have some better resource
                // management.
                //console.log(ex2);
                //console.log("Unable to export gpio: " + n);
            }
            fs.writeFileSync("/sys/class/gpio/gpio" + n + "/direction",
                mode);
            gpio[n].path = "/sys/class/gpio/gpio" + n + "/value";
            return(true);
        } catch(ex) {
            // Perhaps we couldn't open it because it was allocated as an LED
            if(pin.led) {
                fs.writeFileSync(
                    "/sys/class/leds/beaglebone::" + pin.led + "/trigger",
                    "gpio");
                if(mode == OUTPUT) {                    
                    gpio[n].path =
                        "/sys/class/leds/beaglebone::" + pin.led +
                        "/brightness";
                } else {
                    gpio[n].path =
                        "/sys/class/leds/beaglebone::" + pin.led +
                        "/gpio";
                }
                return(true);
            }
        }
    }
};

digitalWrite = exports.digitalWrite = function(pin, value)
{
    fs.writeFileSync(gpio[pin.gpio].path, "" + value);
};

// Wait for some time
if(fibers.exists) {
    delay = exports.delay = function(milliseconds)
    {
        var fiber = Fiber.current;
        setTimeout(function() {
            fiber.run();
        }, milliseconds);
        yield();
    };
} else {
    delay = exports.delay = function(milliseconds)
    {
        var startTime = new Date().getTime();
        while(new Date().getTime() < startTime + milliseconds) {
        }
    };
}

// This is where everything is meant to happen
if(fibers.exists) {
    run = exports.run = function()
    {
        Fiber(function() {
            var fiber = Fiber.current;
            setup();
            if(typeof loop === "function") {
	            while(true) {
                    loop();
                    setTimeout(function() {
                        fiber.run();
                    }, 0);
		            yield();
		        }
            }
        }).run();
    };
} else {
    run = exports.run = function()
    {
        setup();
        if(typeof loop === "function") {
            process.nextTick(function repeat() {
                loop();
                process.nextTick(repeat);
            });
        }
    };
}

// This is a helper function for web servers
var loadFile = function(uri, subdir, res, type) {
    var filename = path.join(subdir, uri);
    path.exists(
        filename,
        function(exists) {
            if(!exists) {
                res.writeHead(404, {"Content-Type": "text/plain"});
                res.write("Error 404: '" + uri + "' Not Found\n");
                res.end();
                return;
            }
            if(type == "binary") {
                fs.readFile(
                    filename,
                    "binary",
                    function(err, file) {
                        if(err) {
                            res.writeHead(500, {"Content-Type": "text/plain"});
                            res.write(err + "\n");
                            res.end();
                            return;
                        }
                        res.writeHead(200);
                        res.write(file, "binary");
                        res.end();
                    }
                );
            } else {
                fs.readFile(
                    filename,
                    encoding='utf8',
                    function(err, file) {
                        if(err) {
                            res.writeHead(500, {"Content-Type": "text/plain"});
                            res.write(err + "\n");
                            res.end();
                            return;
                        }
                        res.writeHead(200, {"Content-Type": type});
                        res.write("" + file);
                        res.end();
                    }
                );
            }
        }
    );
};

var addSocketListeners = function() {};
if(socket.exists) {
    addSocketListeners = function(server, onconnect) {
        var io = socket.listen(server);
        io.sockets.on('connection', function(socket) {
            console.log("New client connected");

            // on message
            socket.on('message', function(data) {
                console.log("Got message from client:", data);
            });

            // on disconnect
            socket.on('disconnect', function() {
                console.log("Client disconnected.");
            });
        
            // listen for requests and reads the debugfs entry async
            socket.on('listMux', function(pinname, fn) {
                console.log(pinname + ": " + bone[pinname].mux);
                path.exists("/sys/kernel/debug/omap_mux/" + bone[pinname].mux, function(exists) {
                    if(exists) {
                        fs.readFile("/sys/kernel/debug/omap_mux/" + bone[pinname].mux, 'utf8', function (err, data) {
                            fn(data, pinname);
                        });
                    } else {
                        // default mux
                        console.log(bone[pinname].mux + ": default mux");
                        fn("0", pinname);
                    }
                });
            });

            // call user-provided on-connect function
            if(typeof onconnect == 'function')
                onconnect(socket);

            // provide client basic platform information
            socket.emit('init', { 'platform': bone });
        });
    };
}

exports.Server = function(port, subdir, onconnect) {
    subdir = path.join(process.cwd(), subdir);
    var handler = function(req, res) {
        var uri = url.parse(req.url).pathname;
        if(uri == '/') {
            loadFile('index.html', subdir, res, "text/html");
        } else {
            if(uri.match(/\.js$/i)) {
                loadFile(uri, subdir, res, "application/javascript");
            } else if(uri.match(/\.css$/i)) {
                loadFile(uri, subdir, res, "text/css");
            } else if(uri.match(/\.htm(.)$/i)) {
                loadFile(uri, subdir, res, "text/html");
            } else if(uri.match(/\.(jpg|png|ico)$/i)) {
                loadFile(uri, subdir, res, "binary");
            } else {
                loadFile(uri, subdir, res, "text/plain");
            }
        }
    };
    this.server6 = http.createServer();
    this.server6.addListener('request', handler);
    addSocketListeners(this.server6, onconnect);
    this.server = http.createServer();
    this.server.addListener('request', handler);
    addSocketListeners(this.server, onconnect);
    this.begin = function() {
        this.server6.listen(port, '::0');
        this.server.listen(port);
    };
};
