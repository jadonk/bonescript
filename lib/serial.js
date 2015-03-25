// Copyright (C) 2013 - Texas Instruments, Jason Kridner
// Modified by Aditya Patadia, Octal Consulting LLP
var fs = require('fs');
var verror = require("verror");
var pinmap = require('./pinmap');
var bone = require('./bone');
var serialPort = bone.require('serialport').SerialPort;
var debug = require('debug')('bone');

var serial = {
	ports: pinmap.uarts,
	openPorts: {}
};

module.exports = {

	enable: function(path, callback) {
		debug("serial.enable(" + path + ")");
		if (!serial.ports[path]) {
			throw new verror("Supplied path:" + path + " is not a vaild serial port path.");
		}
		var txPin = serial.ports[path].tx;
		var rxPin = serial.ports[path].rx;
		var setTxPinState = false;

		bone.find_sysfsFile(txPin + "_pinmux", bone.is_ocp(), txPin + "_pinmux.", onFindPinmux);

		function onFindPinmux(err, data) {
			if (err) {
				err = new verror(err, "Error finding pinmux for: " + txPin);
				console.error(err.message);
				if (callback) callback(err);
				return;
			}
			fs.writeFile(data.path + "/state", "uart", onWriteState);
		}

		function onWriteState(err) {
			if (err) {
				err = new verror(err, "Error setting pin state to UART. Please unload UART cape if already loaded.");
				console.error(err.message);
				if (callback) callback(err);
				return;
			}
			if (setTxPinState) {
				if (callback) callback(null);
			} else {
				setTxPinState = true;
				bone.find_sysfsFile(rxPin + "_pinmux", bone.is_ocp(), rxPin + "_pinmux.", onFindPinmux);
			}
		}
	},

	open: function(path, options, handler, callback) {
		debug("serial.open(" + path + ", " + options + ")");

		if (!serial.ports[path]) {
			throw new verror("Supplied path:" + path + " is not a vaild serial port path.");
		}

		if (typeof handler != "function" || typeof callback != 'function') {
			throw new verror("handler and callback must be provided to serial.open and both should be functions");
		}

		module.exports.enable(path, onSerialEnable);

		function onSerialEnable() {
			if (!serial.openPorts[path]) {
				var port = new serialPort(path, options);
				port.on("open", function(err) {
					if (err) {
						err = new verror(err, "Can't open port : " + path);
						console.error(err.message);
						if (callback) callback(err, null);
						return;
					}
					debug('opened serial port: ' + path);
					port.on('data', handler);
					serial.openPorts[path] = port;
					if (callback) callback(null, serial.openPorts[path]);
				});
			} else {
				if (callback) callback(null, serial.openPorts[path]);
			}
		}

	},

	write: function(path, data, callback) {
		debug("serial.write(" + path + ", " + data + ")");
		if (!serial.openPorts[path]) {
			throw new verror("Serial port " + path + " is not open. Please call serial.open function to open it.");
		}
		var port = serial.openPorts[path];
		port.write(data, callback);
	},

	parsers: serialPort.exists ? serialPort.parsers : {}
};