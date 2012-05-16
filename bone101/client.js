var cssUrls = [
    '/schmux.css',
    '/jquery.terminal.css'          // http://terminal.jcubic.pl/js/jquery.terminal.css
];

var scriptUrls = [
    '/socket.io/socket.io.js',
    '/jquery.js',
    '/jquery.svg.js',
    '/jquery.terminal.js',          // http://terminal.jcubic.pl/js/jquery.terminal-0.4.12.min.js
    '/jquery.mousewheel.js',        // http://terminal.jcubic.pl/js/jquery.mousewheel-min.js
    '/eeprom-web.js',
    '/autoadvance.js'
];

// Placeholder to get filled in from bonescript via socket.io
bone =
{
    P8_1: { name: "DGND" },
    P8_2: { name: "DGND" },
};

var callbacks = {};
var seqnum = 0;
var seqcall = function(data) {
    if(data.seq && (typeof callbacks[data.seq] == 'function')) {
        callbacks[data.seq](data);
        delete callbacks[data.seq];
    }
}

var printPin = function(pinname) {
    $("#" + pinname).css("background-color", "#000000");
}

var clearPin = function(pinname) {
    $("#" + pinname).css("background-color", "#EAF2D3");
}

//var slidyDisable = function() {
//  document.removeEventListener('keydown', w3c_slidy.key_down);
//  document.removeEventListener('keypress', w3c_slidy.key_press);
//};
//
//var slidyEnable = function() {
//  w3c_slidy.add_listener(document, 'keydown', w3c_slidy.key_down);
//  w3c_slidy.add_listener(document, 'keypress', w3c_slidy.key_press);
//}

var initClient = function() {
    //try {
        var socket = io.connect('');
        var view = false;
        try {
            $('#shell').terminal(
                function(command, term) {
                    socket.emit('shell', command);
                    if(!view) {
                        view = function(s) {
                           term.echo(s);
                        };
                    }
                },
                {
                    greetings: "BeagleBone bash shell",
                    name: "bash",
                    height: 600,
                    prompt: 'bash>'
                }
            );
        } catch(ex) {
            console.log("Unable to open shell terminal window due to " + ex);
        }
        var js_term = {};
        var dir = function(obj) {
            var y = [];
            for(var x in obj) {
                if(obj.hasOwnProperty(x)) {
                    y.push(x);
                }
            }
            return y.join(', ');
        }                
        js_term.term = function(command, term) {
            if (command !== '') {
                var result = eval(command);
                if (result !== undefined) {
                    term.echo(String(result));
                }
            } else {
                term.echo('');
            }
        };
        js_term.args = {
                greetings: 'Javascript Interpreter',
                name: 'js_demo',
                height: 600,
                prompt: 'js>'
        };
        try {
            $('#js_term').terminal(js_term.term, js_term.args);
        } catch(ex2) {
            console.log("Unable to open javascript terminal window due to " + ex2);
        }
        socket.on('connect', function() {
            if(view) view('Connected\n');
        });
        socket.on('disconnect', function() {
            if(view) view('Disconnected\n');
        });

        var myfuncs = ['digitalWrite', 'digitalRead', 'analogRead', 'analogWrite',
            'pinMode', 'shiftOut', 'attachInterrupt', 'getPinMode',
            'getEeproms', 'init', 'shell', 'echo'];
        for(var x in myfuncs) {
            if(x == myfuncs.length - 1) break; // this is a very odd bug
            socket.on(myfuncs[x], function(data) {
                seqcall(data);
            });
            var handyfunc = myfuncs[x] + ' = function(data, callback) {\n' +
                                         ' if(callback) {\n' +
                                         '  seqnum++;\n' +
                                         '  callbacks[seqnum] = callback;\n' +
                                         '  data.seq = seqnum;\n' +
                                         ' }\n' +
                                         ' socket.emit("' + myfuncs[x] + '", data);\n' +
                                         '};\n';
            eval(handyfunc);
        }

        socket.on('shell', function(m) {
            if(view) view(m);
        });

        socket.on('getPinMode', function(data) {
            var pinname = data.pin;
            if(data.options) {
                var muxSelect = "<select class='mux'>\n";
                for(var option in data.options) {
                    if(isNaN(option)) continue;
                    var pinFunction = data.options[option];
                    var muxSelected = "";
                    // Select the signal the pin is currently muxed to
                    if(option == data.mux) {
                        muxSelected = "selected=true";
                    }
                    muxSelect += "<option " + muxSelected + ">" + option + ": " + pinFunction + "</option>";
                }
                muxSelect += "</select>\n";
                $("#" + pinname + "_name").html(muxSelect);
                //console.log(pinname + ": " + pinMode);
            }
        });
        
        //setup handler for receiving the strict with all the expansion pins from the server
        socket.on('init', function(data) {
            bone = data.platform;
            for(var pinname in bone) {
                $("#" + pinname + "_name").html(bone[pinname].name);
                if(bone[pinname].mux) {
                    getPinMode({"pin":bone[pinname]});
                }
            }
        });
        
        // Ask for the initialization data
        init({});

        $("#i2c1").hover(
            function () {
                printPin("P9_17");
                printPin("P9_18");
            },
            function () {
                clearPin("P9_17");
                clearPin("P9_18");
            }
        );

        $("#i2c2").hover(
            function () {
                printPin("P9_19");
                printPin("P9_20");
            },
            function () {
                clearPin("P9_19");
                clearPin("P9_20");
            }
        );

        $("#spi1").hover(
            function () {
                printPin("P9_28");
                printPin("P9_29");
                printPin("P9_30");
            },
            function () {
                clearPin("P9_28");
                clearPin("P9_29");
                clearPin("P9_30");
            }
        );

    //} catch(ex) {
    //    setTimeout(init, 100);
    //}
};

// based loosely on http://stackoverflow.com/questions/950087/include-javascript-file-inside-javascript-file
var loadScripts = function() {
    var url = scriptUrls.shift();
    if(url) {
        var head = document.getElementsByTagName('head')[0];
        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = url;
        var scriptObj = head.appendChild(script);
        scriptObj.onload = loadScripts;
    } else {
        initClient();
    }
};

var loadCss = function() {
    var url = cssUrls.shift();
    if(url) {
        var head = document.getElementsByTagName('head')[0];
        var link = document.createElement('link');
        link.rel = 'stylesheet';
        link.type = 'text/css';
        link.href = url;
        var linkObj = head.appendChild(link);
        loadCss();
    } else {
        loadScripts();
    }
};

loadCss();
