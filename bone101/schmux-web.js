// Todo: These 4 should come from bonescript as well
var gpio0 = 0;
var gpio1 = gpio0+32;
var gpio2 = gpio1+32;
var gpio3 = gpio2+32;

// Placeholder to get filled in from bonescript via socket.io
bone = 
{
    P8_1: { name: "DGND" },
    P8_2: { name: "DGND" },
};

function printPin(pinname) {
    $("#" + pinname).css("background-color", "#000000");
}

function clearPin(pinname) {
    $("#" + pinname).css("background-color", "#EAF2D3");
}


$(document).ready(function() {

$("#i2c1").hover(
    function () {
		printPin("P9_17");
        printPin("P9_18");
	},
	function () {
        clearPin("P9_17");
        clearPin("P9_18");
	});	

$("#i2c2").hover(
    function () {
    	printPin("P9_19");
        printPin("P9_20");
	},
	function () {
        clearPin("P9_19");
        clearPin("P9_20");
	});	
    
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
	});

//setup socket.io-client
var socket = new io.connect(); 

//setup handler for receiving the strict with all the expansion pins from the server
socket.on('muxstruct', function (data) {
    bone = data;

    for(var pinname in bone)
    {
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


})
