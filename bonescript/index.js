// Copyright (C) 2011 - Texas Instruments, Jason Kridner 
//
// 
var fs = require('fs');
var child_process = require('child_process');
var http = require('http');
var url = require('url');
var path = require('path');
var events = require('events');
var eeprom = require('./eeprom');
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

var socketio = myrequire('socket.io', function() {
    console.log("Dynamic web features not enabled");
});

var binary = myrequire('binary', function() { });
var inotify = myrequire('inotify', function() { });

var fibers = myrequire('fibers', function() {
    console.log("Delay operations loops will consume CPU cycles");
    console.log("Invoke using 'node-fibers' if node version < 0.5.2");
});

var misc = myrequire('./misc', function () {
    console.log("Miscellaneous C++ functions not built");
    console.log("If desired, try building them with:");
    console.log("  cd bonescript");
    console.log("  node-waf configure build");
    throw("./misc is currently required");
});

if(misc.exists) {
    // Pollpri inherits from EventEmitter
    for(var x in events.EventEmitter.prototype) {
        misc.Pollpri.prototype[x] = events.EventEmitter.prototype[x];
    }
}

OUTPUT = exports.OUTPUT = "out";
INPUT = exports.INPUT = "in";
HIGH = exports.HIGH = 1;
LOW = exports.LOW = 0;
LSBFIRST = 1;  // used in: shiftOut(dataPin, clockPin, bitOrder, val)
MSBFIRST = 0;
CHANGE = exports.CHANGE = "both";
RISING = exports.RISING = "rising";
FALLING = exports.FALLING = "falling";

var gpio = [];

getPinMode = exports.getPinMode = function(pin, callback) {
    var muxFile = '/sys/kernel/debug/omap_mux/' + pin.mux;
    console.log('getPinMode(' + pin.key + '): ' + muxFile);
    var parseMux = function(readout) {
        //console.log('' + readout);
        var mode = {};
        // The format read from debugfs looks like this:
        // name: mcasp0_axr0.spi1_d1 (0x44e10998/0x998 = 0x0023), b NA, t NA
        // mode: OMAP_PIN_OUTPUT | OMAP_MUX_MODE3
        // signals: mcasp0_axr0 | ehrpwm0_tripzone | NA | spi1_d1 | mmc2_sdcd_mux1 | NA | NA | gpio3_16
        var breakdown = '';
        try {
            breakdown = readout.split('\n');
        } catch(ex) {
            console.log('Unable to parse mux readout "' + readout + '": ' + ex);
            return(mode);
        }
        try {        
            // Parse the muxmode number, '3' in the above example
            mode.mux = breakdown[1].split('|')[1].substr(-1);
            // Parse the mux register value, '0x0023' in the above example
            var pinData = parseInt(breakdown[0].split('=')[1].substr(1,6));
            //console.log('pinData = ' + pinData);
            mode.slew = (pinData & 0x40) ? 'slow' : 'fast';
            mode.rx = (pinData & 0x20) ? 'enabled' : 'disabled';
            var pullup = (pinData & 0x18) >> 3;
            switch(pullup) {
            case 1:
                mode.pullup = 'disabled';
                break;
            case 2:
                mode.pullup = 'pullup';
                break;
            case 0:
                mode.pullup = 'pulldown';
                break;
            case 3:
            default:
                console.error('Unknown pullup value: '+pullup);
            }
        } catch(ex2) {
            console.log('Unable to parse mux mode "' + breakdown + '": ' + ex2);
        }
        try {
            mode.options = breakdown[2].split('|');
            for(var option in mode.options) {
                var x = ''+mode.options[option];
                try {
                    mode.options[option] = x.replace(/ /g, '').replace('signals:', '');
                } catch(ex) {
                    console.log('Unable to parse option "' + x + '": ' + ex);
                    mode.options[option] = 'NA';
                }
            }
        } catch(ex3) {
            console.log('Unable to parse options "' + breakdown + '": ' + ex3);
            mode.options = null;
        }
        return(mode);
    };
    var readMux = function(err, data) {
        var mode = parseMux(data);
        mode.pin = pin.key;
        callback(mode);
    };
    if(callback) {
        path.exists(muxFile, function(exists) {
            if(exists) {
                fs.readFile(muxFile, 'utf8', readMux);
            } else {
                // default mux
                callback({'pin': pin.key});
                console.log('getPinMode(' + pin.key + '): no valid mux data');
            }
        });
    } else {
        try {
            var data = fs.readFileSync(muxFile, 'utf8');
            var mode = parseMux(data);
            mode.pin = pin.key;
            return(mode);
        } catch(ex) {
            console.log('getPinMode(' + pin.key + '): ' + ex);
            return({'pin': pin.key});
        }
    }
};

pinMode = exports.pinMode = function(pin, direction, pullup, slew, mux, callback)
{
    pullup = pullup || 'disabled';
    slew = slew || 'fast';
    mux = mux || 7; // default to GPIO mode
    
    if(!pin.mux) {
        console.log('Invalid pin object for pinMode: ' + pin);
        throw('Invalid pin object for pinMode: ' + pin);
    }

    var muxFile = '/sys/kernel/debug/omap_mux/' + pin.mux;
    var gpioFile = '/sys/class/gpio/gpio' + pin.gpio + '/value';
    
    // Handle case where pin is allocated as a gpio-led
    if(pin.led) {
        if((direction != OUTPUT) || (mux != 7)) {                    
            console.log('pinMode only supports GPIO output for LEDs: ' + pin);
            if(callback) callback(false);
            return(false);
        }
        gpioFile = '/sys/class/leds/beaglebone::' + pin.led + '/brightness';
    }

    // Figure out the desired value
    var pinData = 0;
    if(slew == 'slow') pinData |= 0x40;
    if(direction != OUTPUT) pinData |= 0x20;
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
    
    try {
        var fd = fs.openSync(muxFile, 'w');
        fs.writeSync(fd, pinData.toString(16), null);
    } catch(ex) {
        console.error('Unable to configure mux for pin ' + pin + ': ' + ex);
        gpio[n] = {};
        if(callback) callback(false);
        return(false);
    }

    // Enable GPIO, if not already done
    var n = pin.gpio;
    if(mux == 7) {
        if(!gpio[n] || !gpio[n].path) {
            gpio[n] = {'path': gpioFile};
    
            if(pin.led) {
                fs.writeFileSync(
                    "/sys/class/leds/beaglebone::" + pin.led + "/trigger",
                    "gpio");
            } else {    
                // Export the GPIO controls
                var exists = path.existsSync(gpioFile);
                if(exists) {
                    console.log("gpio: " + n + " already exported.");
                } else {
                    try {
                        fs.writeFileSync("/sys/class/gpio/export", "" + n, null);
                        fs.writeFileSync("/sys/class/gpio/gpio" + n + "/direction",
                            direction, null);
                    } catch(ex) {
                        console.error('Unable to export gpio ' + n + ': ' + ex);
                        gpio[n] = {};
                        if(callback) callback(false);
                        return(false);
                    }
                }
            }
        }
    } else {
        gpio[n] = {};
    }
    
    if(callback) callback(true);
    return(true);
};

digitalWrite = exports.digitalWrite = function(pin, value, callback)
{
    if(callback) {
        fs.writeFile(gpio[pin.gpio].path, '' + value, null, callback);
    } else {
        fs.writeFileSync(gpio[pin.gpio].path, '' + value, null);
    }
    return(true);
};

digitalRead = exports.digitalRead = function(pin, callback)
{
    if(callback) {
        var readFile = function(err, data) {
            callback({'value':data});
        };
        fs.readFile(gpio[pin.gpio].path, readFile);
        return(true);
    }
    return(fs.readFileSync(gpio[pin.gpio].path));
};

analogRead = exports.analogRead = function(pin, callback)
{
    var ainFile = '/sys/bus/platform/devices/tsc/ain' + (pin.ain+1);
    if(callback) {
        var readFile = function(err, data) {
            callback({'value':data});
        };
        fs.readFile(ainFile, readFile);
        return(true);
    }
    return(fs.readFileSync(ainFile));
}; 

shiftOut = exports.shiftOut = function(dataPin, clockPin, bitOrder, val, callback)
{
  var i;
  var bit;
  for (i = 0; i < 8; i++)  
  {
    if (bitOrder == LSBFIRST) 
    {
         bit = val & (1 << i);
    } else
    {
         bit = val & (1 << (7 - i));
    }

    digitalWrite(dataPin, bit);
    digitalWrite(clockPin, HIGH);
    digitalWrite(clockPin, LOW);            
  }
};

attachInterrupt = exports.attachInterrupt = function(pin, handler, mode) {
    var gpioFile = '/sys/class/gpio/gpio' + pin.gpio + '/value';
    var gpioPoll = new misc.Pollpri(gpioFile);
    gpio[pin.gpio].handler = handler;
    var gpioHandler = function(value) {
        handler(pin, value);
    };
    gpioPoll.on('ping', gpioHandler);
    var gpioPing = function() {
        gpioPoll.ping();
        gpioPoll.pollpri(gpioPing);
    };
    gpioPoll.pollpri(gpioPing);
};

// Wait for some time
if(fibers.exists) {
    delay = exports.delay = function(milliseconds) {
        var fiber = Fiber.current;
        var run = function() {
            fiber.run();
        };
        setTimeout(run, milliseconds);
        yield(null);
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
		            yield(null);
		        }
            }
        }).run();
    };
} else {
    run = exports.run = function()
    {
        setup();
        if(typeof loop === "function") {
            var repeat = function repeat() {
                loop();
                process.nextTick(repeat);
            };
            repeat();
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

// most heavily borrowed from https://github.com/itchyny/browsershell
var spawn = function(socket) {
    var stream = '';
    var timer;
    var len = 0;
    var c;

    var send = function (data) {
       // add data to the stream
       stream += data.toString();
       ++len;

       // clear any existing timeout if it exists
       if(timer) clearTimeout(timer);

       // set new timeout
       timer = setTimeout(function () {
           socket.emit('shell', stream);
           stream = '';
           len = 0;
       }, 100);

       // send data if over threshold
       if(len > 1000)
       {
           clearTimeout(timer);
           socket.emit('shell', stream);
           stream = '';
           len = 0;
       }
    };

    var receive = function (msg) {
        if(!c) {
            try {
                console.log('Spawning bash');
                c = child_process.spawn('/bin/bash', ['-i'], {customFds: [-1, -1, -1]});
                c.stdout.on('data', send);
                c.stderr.on('data', send);
                c.on('exit', function() {
                    socket.emit('shell', send('\nexited\n'));
                    c = undefined;
                });
                socket.on('disconnect', function () {
                    console.log('Killing bash');
                    c.kill('SIGHUP');
                });
            } catch(ex) {
                c = undefined;
                send('Error invoking bash');
                console.log('Error invoking bash');
            }
        }
        if(c) {
            if(msg) {
                c.stdin.write(msg + '\n', encoding='utf-8');
            }
        } else {
            console.log('Unable to invoke child process');
        }
    };
    receive();

    return(receive);
};

var addSocketListeners = function() {};
if(socketio.exists) {
    addSocketListeners = function(server, onconnect) {
        var io = socketio.listen(server);
        console.log('Listening for new socket.io clients');
        io.sockets.on('connection', function(socket) {
            var sessionId = socket.sessionId;
            console.log('Client connected: ' + sessionId);

            // on message
            socket.on('message', function(data) {
                console.log("Got message from client:", data);
            });

            // on disconnect
            socket.on('disconnect', function() {
                console.log("Client disconnected:" + sessionId);
            });

            // send eeprom info
            socket.on('eeproms', function() {
                var EepromFiles = {
                    '/sys/bus/i2c/drivers/at24/1-0050/eeprom': { type: 'bone' },
                    '/sys/bus/i2c/drivers/at24/3-0054/eeprom': { type: 'cape' },
                    '/sys/bus/i2c/drivers/at24/3-0055/eeprom': { type: 'cape' },
                    '/sys/bus/i2c/drivers/at24/3-0056/eeprom': { type: 'cape' },
                    '/sys/bus/i2c/drivers/at24/3-0057/eeprom': { type: 'cape' },
                };
                var eeproms = eeprom.readEeproms(EepromFiles);
                if(eeproms == {}) {
                    console.warn('No valid EEPROM contents found');
                } else {
                    socket.emit('eeproms', eeproms);
                }
            });
        
            // listen for requests and reads the debugfs entry async
            socket.on('getPinMode', function(m) {
                var callback = function(resp) {
                    socket.emit('getPinMode', resp);
                };
                try {
                    getPinMode(m.pin, callback);
                } catch(ex) {
                    console.log('Error handing getPinMode message: ' + ex);
                }
            });

            // listen for shell commands
            var myshell = spawn(socket);
            socket.on('shell', function(shellMsg) {
                console.log('shell: ' + shellMsg);
                myshell(shellMsg);
            });

            socket.on('pinMode', function(m) {
                var callback = function(resp) {
                    socket.emit('pinMode', resp);
                };
                try {
                    pinMode(m.pin, m.direction, m.pullup, m.slew, m.mux, callback);
                } catch(ex) {
                    console.log('Error handing pinMode message: ' + ex);
                }
            });

            socket.on('digitalWrite', function(m) {
                var callback = function(resp) {
                    socket.emit('digitalWrite', resp);
                };
                try {
                    digitalWrite(m.pin, m.value, callback);
                } catch(ex) {
                    console.log('Error handing digitalWrite message: ' + ex);
                }
            });
            
            socket.on('digitalRead', function(m) {
                var callback = function(resp) {
                    socket.emit('digitalRead', resp);
                };
                try {
                    digitalRead(m.pin, callback);
                } catch(ex) {
                    console.log('Error handing digitalRead message: ' + ex);
                }
            });

            socket.on('analogRead', function(m) {
                var callback = function(resp) {
                    socket.emit('analogRead', resp);
                };
                try {
                    analogRead(m.pin, callback);
                } catch(ex) {
                    console.log('Error handing analogRead message: ' + ex);
                }
            });
            
            socket.on('shiftOut', function(m) {
                var callback = function(resp) {
                    socket.emit('shiftOut', resp);
                };
                try {
                    shiftOut(m.dataPin, m.clockPin, m.bitOrder, m.val, callback);
                } catch(ex) {
                    console.log('Error handing shiftOut message: ' + ex);
                }
            });
            
            socket.on('echo', function(data) {
                socket.emit('echo', data);
            });

            // provide client basic platform information
            socket.on('init', function() {
                socket.emit('init', { 'platform': bone });
            });

            // call user-provided on-connect function
            if(typeof onconnect == 'function')
                onconnect(socket);
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
