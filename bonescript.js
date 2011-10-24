// Copyright (C) 2011 - Texas Instruments, Jason Kridner 
//
// 
var fs = require('fs');

var gpio0 = 0;
var gpio1 = gpio0+32;
var gpio2 = gpio1+32;
var gpio3 = gpio2+32;

bone = exports.bone =
{
    P8_1: { name: "DGND" },
    P8_2: { name: "DGND" },
    P8_3: { name: "GPIO1_6", gpio: gpio1+6, mux: "gpmc_ad6" },
    P8_4: { name: "GPIO1_7", gpio: gpio1+7, mux: "gpmc_ad7" },
    P8_5: { name: "GPIO1_2", gpio: gpio1+2, mux: "gpmc_ad2" },
    P8_6: { name: "GPIO1_3", gpio: gpio1+3, mux: "gpmc_ad3" },
    P8_7: { name: "TIMER4", gpio: gpio2+2, mux: "gpmc_advn_ale" },
    P8_8: { name: "TIMER7", gpio: gpio2+3, mux: "gpmc_oen_ren" },
    P8_9: { name: "TIMER5", gpio: gpio2+5, mux: "gpmc_ben0_cle" },
    P8_10: { name: "TIMER6", gpio: gpio2+4, mux: "gpmc_wen" },
    P8_11: { name: "GPIO1_13", gpio: gpio1+13, mux: "gpmc_ad13" },
    P8_12: { name: "GPIO1_12", gpio: gpio1+12, mux: "gpmc_ad12" },
    P8_13: { name: "EHRPWM2B", gpio: gpio0+23, mux: "gpmc_ad9" },
    P8_14: { name: "GPIO0_26", gpio: gpio0+26, mux: "gpmc_ad10" },
    P8_15: { name: "GPIO1_15", gpio: gpio1+15, mux: "gpmc_ad15" },
    P8_16: { name: "GPIO1_14", gpio: gpio1+14, mux: "gpmc_ad14" },
    P8_17: { name: "GPIO0_27", gpio: gpio0+27, mux: "gpmc_ad11" },
    P8_18: { name: "GPIO2_1", gpio: gpio2+1, mux: "" },
    P8_19: { name: "EHRPWM2A", gpio: gpio0+22, mux: "gpmc_ad8" },
    P8_20: { name: "GPIO1_31", gpio: gpio1+31, mux: "" },
    P8_21: { name: "GPIO1_30", gpio: gpio1+30, mux: "" },
    P8_22: { name: "GPIO1_5", gpio: gpio1+5, mux: "" },
    P8_23: { name: "GPIO1_4", gpio: gpio1+4, mux: "" },
    P8_24: { name: "GPIO1_1", gpio: gpio1+1, mux: "" },
    P8_25: { name: "GPIO1_0", gpio: gpio1+0, mux: "" },
    P8_26: { name: "GPIO1_29", gpio: gpio1+29, mux: "" },
    P8_27: { name: "GPIO2_22", gpio: gpio2+22, mux: "" },
    P8_28: { name: "GPIO2_24", gpio: gpio2+24, mux: "" },
    P8_29: { name: "GPIO2_23", gpio: gpio2+23, mux: "" },
    P8_30: { name: "GPIO2_25", gpio: gpio2+25, mux: "" },
    P8_31: { name: "UART5_CTSN", gpio: gpio0+10, mux: "" },
    P8_32: { name: "UART5_RTSN", gpio: gpio0+11, mux: "" },
    P8_33: { name: "UART4_RTSN", gpio: gpio0+9, mux: "" },
    P8_34: { name: "UART3_RTSN", gpio: gpio2+17, mux: "" },
    P8_35: { name: "UART4_CTSN", gpio: gpio0+8, mux: "" },
    P8_36: { name: "UART3_CTSN", gpio: gpio2+16, mux: "" },
    P8_37: { name: "UART5_TXD", gpio: gpio2+14, mux: "" },
    P8_38: { name: "UART5_RXD", gpio: gpio2+15, mux: "" },
    P8_39: { name: "GPIO2_12", gpio: gpio2+12, mux: "" },
    P8_40: { name: "GPIO2_13", gpio: gpio2+13, mux: "" },
    P8_41: { name: "GPIO2_10", gpio: gpio2+10, mux: "" },
    P8_42: { name: "GPIO2_11", gpio: gpio2+11, mux: "" },
    P8_43: { name: "GPIO2_8", gpio: gpio2+8, mux: "" },
    P8_44: { name: "GPIO2_9", gpio: gpio2+9, mux: "" },
    P8_45: { name: "GPIO2_6", gpio: gpio2+6, mux: "" },
    P8_46: { name: "GPIO2_7", gpio: gpio2+7, mux: "" },
    P9_1: { name: "DGND" },
    P9_2: { name: "DGND" },
    P9_3: { name: "VDD_3V3" },
    P9_4: { name: "VDD_3V3" },
    P9_5: { name: "VDD_5V" },
    P9_6: { name: "VDD_5V" },
    USR0: { name: "USR0", gpio: gpio1+21, led: "usr0" },
    USR1: { name: "USR1", gpio: gpio1+22, led: "usr1" },
    USR2: { name: "USR2", gpio: gpio1+23, led: "usr2" },
    USR3: { name: "USR3", gpio: gpio1+24, led: "usr3" },
    TBD: { }
};

var gpio = [];

OUTPUT = exports.OUTPUT = "out";
INPUT = exports.INPUT = "in";
HIGH = exports.HIGH = 1;
LOW = exports.LOW = 0;

pinMode = exports.pinMode = function(pin, mode)
{
    var n = pin.gpio;
    
    if(!gpio[n] || !gpio[n].path) {
        gpio[n] = {};
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
            // Otherwise, it is probably a pinmux issue
            if(pin.mux) {
                try {
                    fs.writeFileSync(
                        "/sys/kernel/debug/omap_mux/" + pin.mux,
                        "0x07");
                    fs.writeFileSync(
                        "/sys/class/gpio/export", 
                        "" + n);
                    fs.writeFileSync(
                        "/sys/class/gpio/gpio" + n + "/direction",
                        mode);
                    gpio[pin.gpio].path = 
                        "/sys/class/gpio/gpio" + n + "/value";
                    return(true);
                } catch(ex3) {
                    console.log("WARNING: " + ex3);
                    console.log("Unable to configure pin mux: " + pin.mux);
                }
            }
        }
    }
};

digitalWrite = exports.digitalWrite = function(pin, value)
{
    fs.writeFileSync(gpio[pin.gpio].path, "" + value);
};

// Currently, this implementation causes no events to be
// serviced in this time.  What I might do in the future is
// to add node-fibers around loop.  For this to be clean,
// I'll wait until we update to node >= 0.5.2.
//
// https://github.com/laverdet/node-fibers
delay = exports.delay = function(milliseconds)
{
    var startTime = new Date().getTime();
    while(new Date().getTime() < startTime + milliseconds) {
    }
};

run = exports.run = function()
{
    setup();
    process.nextTick(function repeat() {
        loop()
        process.nextTick(repeat);
    });
};
