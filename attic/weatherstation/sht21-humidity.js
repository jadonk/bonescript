exports.humidityConfig = {
    file: "/sys/bus/i2c/drivers/sht21/3-0040/humidity1_input",
    unit: "% RH",
    delay: 2000,
    scale: 1000,
    rangeHigh: 100,
    rangeLow: 0,
};

exports.tempConfig = {
    file: "/sys/bus/i2c/drivers/sht21/3-0040/temp1_input",
    unit: "° C",
    delay: 2000,
    scale: 1000,
    rangeHigh: 40,
    rangeLow: -20,
};