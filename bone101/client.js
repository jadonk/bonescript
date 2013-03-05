var cssUrls = [
    'schmux.css',
    'jquery.terminal.css',         // http://terminal.jcubic.pl/js/jquery.terminal.css
    'jquery-ui.css',               // http://ajax.googleapis.com/ajax/libs/jqueryui/1.8/themes/base/jquery-ui.css
    'client.css'
];

var scriptUrls = [
    'jquery.js',
    'jquery.svg.js',
    'jquery.terminal.js',          // http://terminal.jcubic.pl/js/jquery.terminal-0.4.12.min.js
    'jquery.mousewheel.js',        // http://terminal.jcubic.pl/js/jquery.mousewheel-min.js
    'eeprom-web.js',
    'autoadvance.js',
    'processing.js',
    'jquery-ui.min.js',         // http://ajax.googleapis.com/ajax/libs/jqueryui/1.8/jquery-ui.min.js
    'weatherstation.js',
    'bone.js',
    'ajaxorg-ace-builds-c2f3abb/ace.js' // https://github.com/ajaxorg/ace-builds/commit/c2f3abb2ecd3287f90225d804132f0fd26cfb639
];

var doAlert = function(m) {
    alert(JSON.stringify(m));
};

var demoRun = function(id) {
    var myScript = document.getElementById(id).innerHTML;
    myScript = myScript.replace("&lt;", "<");
    myScript = myScript.replace("&gt;", ">");
    myScript = myScript.replace("&amp;", "&");
    eval(myScript);
};

var callbacks = {};
var seqnum = 0;
var seqcall = function(data) {
    if(data.seq && (typeof callbacks[data.seq] == 'function')) {
        callbacks[data.seq](data);
        if(data.oneshot) delete callbacks[data.seq];
    }
}

var printPin = function(pinname) {
    $("#" + pinname).css("background-color", "#000000");
}

var clearPin = function(pinname) {
    $("#" + pinname).css("background-color", "#EAF2D3");
}

var setMuxSelect = function(data) {
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
};

var completeMux = function(data, onMux) {
    bone = data.platform;
    for(var pinname in bone) {
        $("#" + pinname + "_name").html(bone[pinname].name);
        if(bone[pinname].mux) {
            onMux(bone[pinname], setMuxSelect);
        }
    }
};

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
    $("#slider1").slider();
    $("#slider2").slider();
    
    $("#buttons").append("<p>" +
      "<button class=\"dynlink\" onclick=\"demoRun('code')\">Run</button>" +
      "<button class=\"dynlink\" onclick=\"demoEdit('code')\">Editor</button>" +
      "<button class=\"dynlink\" onclick=\"openJSTerm('js_term')\">Interpreter</button>" +
      "</p>");

    demoEdit = function(id) {
        var editor = ace.edit(id);
        editor.setTheme("ace/theme/monokai");
        editor.getSession().setMode("ace/mode/javascript");
        var originalDemoRun = demoRun;
        demoRun = function(myid) {
            if(myid == id) eval(editor.getValue());
            else originalDemoRun(myid);
        }
    };
    
    try {
        var canvas = document.getElementById("canvas1");
        var graphDataSize = 50;
        window.graphData = new Array(graphDataSize);
        for(var i=0; i<graphDataSize; i++) {
            window.graphData[i] = 0;
        }
        var sketchProc = function(p) {
            p.size(600, 250);

            // variables referenced elsewhere
            window.height = p.height;

            // variables that might get updated
            window.rangeLow = 0;
            window.rangeHigh = 1;
            window.scaleY = window.height / (window.rangeHigh - window.rangeLow);

            // local variables
            var stepX = p.width / (graphDataSize - 1);
            var centerY = window.height / 2;

            p.noLoop();
            p.draw = function() {
                // erase background
                p.background(224);

                // draw axis
                p.stroke(25);
                p.strokeWeight(1);
                p.line(0, centerY, p.width, centerY);
                
                // draw graph
                p.stroke(0);
                p.strokeWeight(3);
                //p.line(0, centerY+1, p.width, centerY+1);
                var lastX = 0, nextX = 0, lastY, nextY;
                for(var point in window.graphData) {
                    nextY = ((window.rangeHigh - window.graphData[point]) * scaleY);
                    if(point != 0) {
                        p.line(lastX, lastY, nextX, nextY);
                        lastX += stepX;
                    }
                    nextX += stepX;
                    lastY = nextY;
                }
            };
        };
        var processing = new Processing(canvas, sketchProc);
        graphDraw = function(data) {
            var myData = parseFloat(data);
            for(var i=0; i<graphDataSize-1; i++) {
                window.graphData[i] = window.graphData[i+1];
            }
            window.graphData[i] = myData;
            if (myData > rangeHigh) {
                rangeHigh = myData;
                window.scaleY = window.height / (window.rangeHigh - window.rangeLow);
            }
            if (myData < rangeLow) {
                rangeLow = myData;
                window.scaleY = window.height / (window.rangeHigh - window.rangeLow);
            }
            processing.redraw();
        };
    } catch(ex) {
        console.log('Unable to attach Processing.JS to canvas because ' + ex);
    }

    var onSocketIOLoaded = function() {
        try {
            var socket = io.connect('');
            var myfuncs = {
                'digitalWrite': [ 'pin', 'value' ],
                'digitalRead': [ 'pin' ],
                'analogRead': [ 'pin' ],
                'analogWrite': [ 'pin', 'value', 'freq' ],
                'pinMode': [ 'pin', 'direction', 'mux', 'pullup', 'slew' ],
                'shiftOut': [ 'dataPin', 'clockPin', 'bitOrder', 'val' ],
                'attachInterrupt': [ 'pin', 'handler', 'mode' ],
                'detachInterrupt': [ 'pin' ],
                'getPinMode': [ 'pin' ],
                'getEeproms': [],
                'platform': [],
                'shell': [ 'command' ],
                'echo': [ 'data' ],
                'doEval': [ 'evalFunc' ],
                'addLoop': [ 'loopFunc', 'loopDelay' ],
                'getLoops': [],
                'removeLoop': [ 'loopid' ],
                'removeLoops': [],
                'readTextFile': [ 'filename' ],
                'writeTextFile': [ 'filename', 'data' ]
            };
            for(var x in myfuncs) {
                socket.on(x, function(data) {
                    seqcall(data);
                });
                var myargs = myfuncs[x];
                var objString = '';
                for(var y in myargs) {
                    if(isNaN(y)) continue;  // Need to find the source of this bug
                    objString += ' if(typeof ' + myargs[y] + ' == "function") {\n';
                    objString += '  ' + myargs[y] + ' = ' + myargs[y] + '.toString();\n';
                    objString += ' }\n';
                    objString += ' calldata.' + myargs[y] + ' = ' + myargs[y] + ';\n';
                }
                myargs.push('callback');
                var argsString = myargs.join(', ');
                var handyfunc = x + ' = ' +
                    'function (' + argsString + ') {\n' +
                    ' var calldata = {};\n' +
                    objString +
                    ' if(callback) {\n' +
                    '  seqnum++;\n' +
                    '  callbacks[seqnum] = callback;\n' +
                    '  calldata.seq = seqnum;\n' +
                    ' }\n' +
                    ' socket.emit("' + x + '", calldata);\n' +
                    '};\n';
                eval(handyfunc);
            }
    
            try {
                var addedShellListener = false;
                $('#shell').terminal(
                    function(command, term) {
                        if(!addedShellListener) {
                            socket.on('shell', function(s) {
                                term.echo(s);
                            });
                            addedShellListener = true;
                        }
                        shell(command);
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
                if(command !== '') {
                    var result = eval(command);
                    if (result !== undefined) {
                        term.echo(String(result));
                    }
                }
            };
            js_term.args = {
                    greetings: 'Javascript Interpreter',
                    name: 'js_demo',
                    height: 300,
                    prompt: 'js>'
            };
            openJSTerm = function(id) {
                var myJSTerm = document.getElementById(id);            
                if(myJSTerm.hasTerminal && myJSTerm.isEnabled) {
                    $(myJSTerm).terminal.disable();
                    myJSTerm.isEnabled = false;
                } else {
                    $(myJSTerm).terminal(js_term.term, js_term.args);
                    myJSTerm.isEnabled = true;
                }
                myJSTerm.hasTerminal = true;
            };
                
            //setup handler for receiving the strict with all the expansion pins from the server
            var completeMuxWrapper = function(data) {
                completeMux(data, getPinMode);
            };
            platform(completeMuxWrapper);
            
        } catch(ex) {
            console.log("Unable to attach socket functions due to " + ex);
        }
    };
    
    var getDefaultMode = function(pin, callback) {
        var mode = exports.bone[pin.key];
        mode.pin = pin.key;
        callback(mode);
    };
    completeMux({platform:exports.bone}, getDefaultMode);
    loadScript('/socket.io/socket.io.js', onSocketIOLoaded);

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
};

var loadScript = function(url, callback) {
    var head = document.getElementsByTagName('head')[0];
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = url;
    script.charset = 'UTF-8';
    var scriptObj = head.appendChild(script);
    scriptObj.onload = callback;
}

// based loosely on http://stackoverflow.com/questions/950087/include-javascript-file-inside-javascript-file
var loadScripts = function() {
    var url = scriptUrls.shift();
    if(url) {
        loadScript(url, loadScripts);
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
