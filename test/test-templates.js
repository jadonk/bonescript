var my = require('../node_modules/bonescript/my');
var bone = require('../node_modules/bonescript/bone');

var pin = 
    {
        "name": "PIN_NAME",
        "gpio": 0,
        "mux": "mux_name",
        "eeprom": 1,
        "pwm": {
            "module": "pwm_module",
            "index": 0,
            "muxmode": 4,
            "path": "pwmpath.0:0",
            "name": "PWMNAME"
        },
        "key": "P_NONE",
        "muxRegOffset": "0x0",
        "options": [
                "option0",
                "option1",
                "option2",
                "option3",
                "option4",
                "option5",
                "option6",
                "option7"
            ]
    };
var pinData = 0xFF;

my.create_dt(pin, pinData, 'bspm', false, true);
my.create_dt(pin, pinData, 'bspwm', false, true);
