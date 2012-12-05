exports.pressureConfig = {
    file: "/sys/bus/i2c/drivers/bmp085/3-0077/pressure0_input",
    unit: "milliBar",
    delay: 5000,
    scale: 100,
    rangeHigh: 1100,
    rangeLow: 900,
};

exports.tempConfig = {
    file: "/sys/bus/i2c/drivers/bmp085/3-0077/temp0_input",
    unit: "° C",
    delay: 2000,
    scale: 10,
    rangeHigh: 40,
    rangeLow: -20,
};