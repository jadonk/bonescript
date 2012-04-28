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

var init = function() {
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
                    height: 400,
                    prompt: 'bash>'
                }
            );
        } catch(ex) {
            console.log("Unable to open shell terminal window due to " + ex);
        }
        try {
            $('#js_term').terminal(
                function(command, term) {
                    if (command !== '') {
                        var result = window.eval("(" + command + ")");
                        if (result !== undefined) {
                            term.echo(String(result));
                        }
                    } else {
                        term.echo('');
                    }
                }, {
                    greetings: 'Javascript Interpreter',
                    name: 'js_demo',
                    height: 400,
                    prompt: 'js>'
                }
            );
        } catch(ex) {
            console.log("Unable to open javascript terminal window due to " + ex);
        }
        socket.on('connect', function() {
            if(view) view('Connected\n');
        });
        socket.on('disconnect', function() {
            if(view) view('Disconnected\n');
        });
        socket.on('shell', function(m) {
            if(view) view(m);
        });

        //setup handler for receiving the strict with all the expansion pins from the server
        socket.on('muxstruct', function (data) {
            bone = data;
            for(var pinname in bone) {
                $("#" + pinname + "_name").html(bone[pinname].name);
                if (bone[pinname].mux) {
                    socket.emit("listMux", pinname, function(muxReadout, pinname) {
                        // The format read from debugfs looks like this:
                        // name: mcasp0_axr0.spi1_d1 (0x44e10998/0x998 = 0x0023), b NA, t NA
                        // mode: OMAP_PIN_OUTPUT | OMAP_MUX_MODE3
                        // signals: mcasp0_axr0 | ehrpwm0_tripzone | NA | spi1_d1 | mmc2_sdcd_mux1 | NA | NA | gpio3_16
                        if (muxReadout != "0") {
                            muxBreakdown = muxReadout.split("\n");
                            // The muxmode number, '3' in the above example
                            pinMode = muxBreakdown[1].split("|")[1].substr(-1);

                            muxSelect = "<select style='width: 10em'>\n";
                            for (muxOption in muxBreakdown[2].split("|")) {
                                pinFunction = muxBreakdown[2].split("|")[muxOption].replace('signals:', '');
                                // Select the signal the pin is currently muxed to
                                if (muxOption == pinMode) {
                                    muxSelected = "selected=true";
                                }
                                else {
                                    muxSelected = "";
                                }
                                muxSelect += "<option " + muxSelected + ">" + muxOption + ": " + pinFunction + "</option>";
                            }
                            muxSelect += "</select>\n";

                            $("#" + pinname + "_name").html(muxSelect);
                            //console.log(pinname + ": " + pinMode);
                        }
                    });
                }
            }
        });

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
        init();
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
