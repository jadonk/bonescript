var fs = require('fs');

var gpio0 = 0;
var gpio1 = gpio0+32;
var gpio2 = gpio1+32;
var gpio3 = gpio2+32;

bone =
{
    P8_1: { name: "DGND" },
    P8_2: { name: "DGND" },
    P8_3: { name: "GPIO1_6", gpio: gpio1+6 },
    P8_4: { name: "GPIO1_7", gpio: gpio1+7 },
    P8_5: { name: "GPIO1_2", gpio: gpio1+2 },
    P8_6: { name: "GPIO1_3", gpio: gpio1+3 },
    P8_7: { name: "TIMER4", gpio: gpio2+2 },
    P8_8: { name: "TIMER7", gpio: gpio2+3 },
    P8_9: { name: "TIMER5", gpio: gpio2+5 },
    P8_10: { name: "TIMER6", gpio: gpio2+4 },
    P8_11: { name: "GPIO1_13", gpio: gpio1+13 },
    P8_12: { name: "GPIO1_12", gpio: gpio1+12 },
    P8_13: { name: "EHRPWM2B", gpio: gpio0+23 },
    P8_14: { name: "GPIO0_26", gpio: gpio0+26 },
    P8_15: { name: "GPIO1_15", gpio: gpio1+15 },
    P8_16: { name: "GPIO1_14", gpio: gpio1+14 },
    P8_17: { name: "GPIO0_27", gpio: gpio0+27 },
    P8_18: { name: "GPIO2_1", gpio: gpio2+1 },
    P8_19: { name: "EHRPWM2A", gpio: gpio0+22 },
    P8_20: { name: "GPIO1_31", gpio: gpio1+31 },
    P8_21: { name: "GPIO1_30", gpio: gpio1+30 },
    P8_22: { name: "GPIO1_5", gpio: gpio1+5 },
    P8_23: { name: "GPIO1_4", gpio: gpio1+4 },
    P8_24: { name: "GPIO1_1", gpio: gpio1+1 },
    P8_25: { name: "GPIO1_0", gpio: gpio1+0 },
    P8_26: { name: "GPIO1_29", gpio: gpio1+29 },
    P8_27: { name: "GPIO2_22", gpio: gpio2+22 },
    P8_28: { name: "GPIO2_24", gpio: gpio2+24 },
    P8_29: { name: "GPIO2_23", gpio: gpio2+23 },
    P8_30: { name: "GPIO2_25", gpio: gpio2+25 },
    P8_31: { name: "UART5_CTSN", gpio: gpio0+10 },
    P8_32: { name: "UART5_RTSN", gpio: gpio0+11 },
    P8_33: { name: "UART4_RTSN", gpio: gpio0+9 },
    P8_34: { name: "UART3_RTSN", gpio: gpio2+17 },
    P8_35: { name: "UART4_CTSN", gpio: gpio0+8 },
    P8_36: { name: "UART3_CTSN", gpio: gpio2+16 },
    P8_37: { name: "UART5_TXD", gpio: gpio2+14 },
    P8_38: { name: "UART5_RXD", gpio: gpio2+15 },
    P8_39: { name: "GPIO2_12", gpio: gpio2+12 },
    P8_40: { name: "GPIO2_13", gpio: gpio2+13 },
    P8_41: { name: "GPIO2_10", gpio: gpio2+10 },
    P8_42: { name: "GPIO2_11", gpio: gpio2+11 },
    P8_43: { name: "GPIO2_8", gpio: gpio2+8 },
    P8_44: { name: "GPIO2_9", gpio: gpio2+9 },
    P8_45: { name: "GPIO2_6", gpio: gpio2+6 },
    P8_46: { name: "GPIO2_7", gpio: gpio2+7 },
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

var gpio = {};
//gpio.exp = fs.openSync("/sys/class/gpio/export", "w+");

OUTPUT = "out";
INPUT = "in";
HIGH = 1;
LOW = 0;

pinMode = function(pin, mode)
{
    if(!gpio[pin] || !gpio[pin].path) {
        gpio[pin] = {};
        gpio[pin].path = "/sys/class/gpio/gpio" + pin.gpio;
        //gpio[pin].direction = fs.openSync(gpio[pin].path + "/direction", "w+");
        //gpio[pin].value = fs.openSync(gpio[pin].path + "/value", "r+");
        try {
            fs.writeFileSync("/sys/class/gpio/export", "" + pin.gpio);
        } catch(ex) {
        }
    }
    fs.writeFileSync(gpio[pin].path + "/direction", mode);
};

digitalWrite = function(pin, value)
{
    fs.writeFileSync(gpio[pin].path + "/value", "" + value);
};

delay = function(milliseconds)
{
    var startTime = new Date().getTime();
    while(new Date().getTime() < startTime + milliseconds) {
    }
};

exports.run = function()
{
    setup();
    while(1) {
        loop();
    }
};