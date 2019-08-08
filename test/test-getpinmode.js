//process.env.DEBUG = true;
var b = require('bonescript');

var expectedResults = [{
        "pin": "USR0",
        "name": "USR0"
    },
    {
        "pin": "USR1",
        "name": "USR1"
    },
    {
        "pin": "USR2",
        "name": "USR2"
    },
    {
        "pin": "USR3",
        "name": "USR3"
    },
    {
        "pin": "P8_1",
        "name": "DGND"
    },
    {
        "pin": "P8_2",
        "name": "DGND"
    },
    {
        "pin": "P8_3",
        "name": "GPIO1_6"
    },
    {
        "pin": "P8_4",
        "name": "GPIO1_7"
    },
    {
        "pin": "P8_5",
        "name": "GPIO1_2"
    },
    {
        "pin": "P8_6",
        "name": "GPIO1_3"
    },
    {
        "pin": "P8_7",
        "name": "TIMER4"
    },
    {
        "pin": "P8_8",
        "name": "TIMER7"
    },
    {
        "pin": "P8_9",
        "name": "TIMER5"
    },
    {
        "pin": "P8_10",
        "name": "TIMER6"
    },
    {
        "pin": "P8_11",
        "name": "GPIO1_13"
    },
    {
        "pin": "P8_12",
        "name": "GPIO1_12"
    },
    {
        "pin": "P8_13",
        "name": "EHRPWM2B"
    },
    {
        "pin": "P8_14",
        "name": "GPIO0_26"
    },
    {
        "pin": "P8_15",
        "name": "GPIO1_15"
    },
    {
        "pin": "P8_16",
        "name": "GPIO1_14"
    },
    {
        "pin": "P8_17",
        "name": "GPIO0_27"
    },
    {
        "pin": "P8_18",
        "name": "GPIO2_1"
    },
    {
        "pin": "P8_19",
        "name": "EHRPWM2A"
    },
    {
        "pin": "P8_20",
        "name": "GPIO1_31"
    },
    {
        "pin": "P8_21",
        "name": "GPIO1_30"
    },
    {
        "pin": "P8_22",
        "name": "GPIO1_5"
    },
    {
        "pin": "P8_23",
        "name": "GPIO1_4"
    },
    {
        "pin": "P8_24",
        "name": "GPIO1_1"
    },
    {
        "pin": "P8_25",
        "name": "GPIO1_0"
    },
    {
        "pin": "P8_26",
        "name": "GPIO1_29"
    },
    {
        "pin": "P8_27",
        "name": "GPIO2_22"
    },
    {
        "pin": "P8_28",
        "name": "GPIO2_24"
    },
    {
        "pin": "P8_29",
        "name": "GPIO2_23"
    },
    {
        "pin": "P8_30",
        "name": "GPIO2_25"
    },
    {
        "pin": "P8_31",
        "name": "UART5_CTSN"
    },
    {
        "pin": "P8_32",
        "name": "UART5_RTSN"
    },
    {
        "pin": "P8_33",
        "name": "UART4_RTSN"
    },
    {
        "pin": "P8_34",
        "name": "UART3_RTSN"
    },
    {
        "pin": "P8_35",
        "name": "UART4_CTSN"
    },
    {
        "pin": "P8_36",
        "name": "UART3_CTSN"
    },
    {
        "pin": "P8_37",
        "name": "UART5_TXD"
    },
    {
        "pin": "P8_38",
        "name": "UART5_RXD"
    },
    {
        "pin": "P8_39",
        "name": "GPIO2_12"
    },
    {
        "pin": "P8_40",
        "name": "GPIO2_13"
    },
    {
        "pin": "P8_41",
        "name": "GPIO2_10"
    },
    {
        "pin": "P8_42",
        "name": "GPIO2_11"
    },
    {
        "pin": "P8_43",
        "name": "GPIO2_8"
    },
    {
        "pin": "P8_44",
        "name": "GPIO2_9"
    },
    {
        "pin": "P8_45",
        "name": "GPIO2_6"
    },
    {
        "pin": "P8_46",
        "name": "GPIO2_7"
    },
    {
        "pin": "P9_1",
        "name": "DGND"
    },
    {
        "pin": "P9_2",
        "name": "DGND"
    },
    {
        "pin": "P9_3",
        "name": "VDD_3V3"
    },
    {
        "pin": "P9_4",
        "name": "VDD_3V3"
    },
    {
        "pin": "P9_5",
        "name": "VDD_5V"
    },
    {
        "pin": "P9_6",
        "name": "VDD_5V"
    },
    {
        "pin": "P9_7",
        "name": "SYS_5V"
    },
    {
        "pin": "P9_8",
        "name": "SYS_5V"
    },
    {
        "pin": "P9_9",
        "name": "PWR_BUT"
    },
    {
        "pin": "P9_10",
        "name": "SYS_RESETn"
    },
    {
        "pin": "P9_11",
        "name": "UART4_RXD"
    },
    {
        "pin": "P9_12",
        "name": "GPIO1_28"
    },
    {
        "pin": "P9_13",
        "name": "UART4_TXD"
    },
    {
        "pin": "P9_14",
        "name": "EHRPWM1A"
    },
    {
        "pin": "P9_15",
        "name": "GPIO1_16"
    },
    {
        "pin": "P9_15B",
        "name": "GPIO1_16"
    },
    {
        "pin": "P9_16",
        "name": "EHRPWM1B"
    },
    {
        "pin": "P9_17",
        "name": "I2C1_SCL"
    },
    {
        "pin": "P9_18",
        "name": "I2C1_SDA"
    },
    {
        "pin": "P9_19",
        "name": "I2C2_SCL"
    },
    {
        "pin": "P9_20",
        "name": "I2C2_SDA"
    },
    {
        "pin": "P9_21",
        "name": "UART2_TXD"
    },
    {
        "pin": "P9_22",
        "name": "UART2_RXD"
    },
    {
        "pin": "P9_23",
        "name": "GPIO1_17"
    },
    {
        "pin": "P9_24",
        "name": "UART1_TXD"
    },
    {
        "pin": "P9_25",
        "name": "GPIO3_21"
    },
    {
        "pin": "P9_26",
        "name": "UART1_RXD"
    },
    {
        "pin": "P9_27",
        "name": "GPIO3_19"
    },
    {
        "pin": "P9_28",
        "name": "SPI1_CS0"
    },
    {
        "pin": "P9_29",
        "name": "SPI1_D0"
    },
    {
        "pin": "P9_30",
        "name": "SPI1_D1"
    },
    {
        "pin": "P9_31",
        "name": "SPI1_SCLK"
    },
    {
        "pin": "P9_32",
        "name": "VDD_ADC"
    },
    {
        "pin": "P9_33",
        "name": "AIN4"
    },
    {
        "pin": "P9_34",
        "name": "GNDA_ADC"
    },
    {
        "pin": "P9_35",
        "name": "AIN6"
    },
    {
        "pin": "P9_36",
        "name": "AIN5"
    },
    {
        "pin": "P9_37",
        "name": "AIN2"
    },
    {
        "pin": "P9_38",
        "name": "AIN3"
    },
    {
        "pin": "P9_39",
        "name": "AIN0"
    },
    {
        "pin": "P9_40",
        "name": "AIN1"
    },
    {
        "pin": "P9_41",
        "name": "CLKOUT2"
    },
    {
        "pin": "P9_41B",
        "name": "CLKOUT2"
    },
    {
        "pin": "P9_42",
        "name": "GPIO0_7"
    },
    {
        "pin": "P9_42B",
        "name": "GPIO0_7"
    },
    {
        "pin": "P9_43",
        "name": "DGND"
    },
    {
        "pin": "P9_44",
        "name": "DGND"
    },
    {
        "pin": "P9_45",
        "name": "DGND"
    },
    {
        "pin": "P9_46",
        "name": "DGND"
    },
];

var results = {};

for (var i = 0; i < expectedResults.length; i++) {
    var er = expectedResults[i];
    exports['testGetPinMode' + er.pin] = makeTest(i);
}

function makeTest(i) {
    var pin = expectedResults[i].pin;
    var expected = expectedResults[i];
    return (function (test) {
        test.expect(2);
        test.doesNotThrow(function () {
            results = b.getPinMode(pin);
            // Only compare name to work on travis-ci
            results = {
                "pin": results.pin,
                "name": results.name
            };
        });
        test.ok(compareResults(results, expected));
        test.done();
    });
}

function compareResults(results, expected) {
    console.log("results = " + JSON.stringify(results));
    console.log("expectedResults = " + JSON.stringify(expected));
    for (i in expected) {
        if (results[i] != expected[i]) return (false);
    }
    return (true);
}