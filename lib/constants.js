// Copyright (C) 2013 - Texas Instruments, Jason Kridner
// Modified by Aditya Patadia, Octal Consulting LLP
module.exports = {
	OUTPUT : "out",
	INPUT: "in",
	INPUT_PULLUP: "gpio_pu",
	INPUT_PULLDOWN: "gpio_pd",
	HIGH: 1,
	LOW: 0,
	LSBFIRST: 1, // used in: shiftOut(dataPin, clockPin, bitOrder, val)
	MSBFIRST: 0,
	RISING: "rising",
	FALLING: "falling",
	CHANGE: "both",
	ANALOG_OUTPUT: "analog_out"
};
