// Copyright (C) 2013 - Texas Instruments, Jason Kridner
// Modified by Aditya Patadia, Octal Consulting LLP
var fs = require('fs');
var verror = require("verror");
var bone = require('./bone');
var i2cPort = bone.require("i2c");
var pinmap = require('./pinmap');
var debug = require('debug')('bone');

var i2c = {
	ports: pinmap.i2c,
	openPorts: {}
};

module.exports = {
	enable: function(path, callback) {
		debug("i2c.enable(" + path + ")");
		if (!i2c.ports[path]) {
			throw new verror("Supplied path:" + path + " is not a vaild i2c port path.");
		}
		var sclPin = i2c.ports[path].scl;
		var sdaPin = i2c.ports[path].sda;
		var setSclPinState = false;

		bone.find_sysfsFile(sclPin + "_pinmux", bone.is_ocp(), sclPin + "_pinmux.", onFindPinmux);

		function onFindPinmux(err, data) {
			if (err) {
				err = new verror(err, "Error finding pinmux for: " + txPin);
				console.error(err.message);
				if (callback) callback(err);
				return;
			}
			fs.writeFile(data.path + "/state", "i2c", onWriteState);
		}

		function onWriteState(err) {
			if (err) {
				err = new verror(err, "Error setting pin state to I2C. Please unload I2C cape if already loaded.");
				console.error(err.message);
				if (callback) callback(err);
				return;
			}
			if (setSclPinState) {
				if (callback) callback(null);
			} else {
				setSclPinState = true;
				bone.find_sysfsFile(sdaPin + "_pinmux", bone.is_ocp(), sdaPin + "_pinmux.", onFindPinmux);
			}
		}
	},

	open: function(path, address, handler, callback) {
		debug("i2c.open(" + path + ", " + address + ")");

		if (!i2c.ports[path]) {
			throw new verror("Supplied path:" + path + " is not a vaild i2c port path.");
		}

		if (typeof handler != "function" || typeof callback != 'function') {
			throw new verror("handler and callback must be provided to i2c.open and both should be functions");
		}

		module.exports.enable(path, onI2CEnable);

		function onI2CEnable(err) {
			if (err) {
				throw new verror(err);
			}

			if (!i2c.openPorts[path]) {
				var port = new i2cPort(address, {
					device: i2c.ports[path].path
				});
				debug('opened i2c port: ' + path);
				port.on('data', handler);
				i2c.openPorts[path] = port;
				if (callback) callback(null, i2c.openPorts[path]);
			} else {
				if (callback) callback(null, i2c.openPorts[path]);
			}
		}
	},

	writeByte: function(path, byte, callback) {
		debug("i2c.writeByte(" + path + ", " + byte + ")");
		if (!i2c.openPorts[path]) {
			throw new verror("I2C port " + path + " is not open. Please call i2c.open function to open it.");
		}
		var port = i2c.openPorts[path];
		port.writeByte(byte, callback);
	},

	writeBytes: function(path, command, byteArray, callback) {
		debug("i2c.writeBytes(" + path + ", " + command + ", " + byteArray + ")");
		if (!i2c.openPorts[path]) {
			throw new verror("I2C port " + path + " is not open. Please call i2c.open function to open it.");
		}
		var port = i2c.openPorts[path];
		port.writeBytes(command, byteArray, callback);
	},

	readByte: function(path, callback) {
		debug("i2c.readByte(" + path + ")");
		if (!i2c.openPorts[path]) {
			throw new verror("I2C port " + path + " is not open. Please call i2c.open function to open it.");
		}
		var port = i2c.openPorts[path];
		port.readByte(callback);
	},

	readBytes: function(path, command, length, callback) {
		debug("i2c.readBytes(" + path + ", " + command + ", " + length + ")");
		if (!i2c.openPorts[path]) {
			throw new verror("I2C port " + path + " is not open. Please call i2c.open function to open it.");
		}
		var port = i2c.openPorts[path];
		port.readBytes(command, length, callback);
	},

	stream: function(path, command, length, delay) {
		debug("i2c.readBytes(" + path + ", " + command + ", " + length + ", " + delay + ")");
		if (!i2c.openPorts[path]) {
			throw new verror("I2C port " + path + " is not open. Please call i2c.open function to open it.");
		}
		var port = i2c.openPorts[path];
		port.stream(command, length, delay);
	},

	write: function(path, byteArray, callback) {
		debug("i2c.readBytes(" + path + ", " + byteArray + ")");
		if (!i2c.openPorts[path]) {
			throw new verror("I2C port " + path + " is not open. Please call i2c.open function to open it.");
		}
		var port = i2c.openPorts[path];
		port.write(byteArray, callback);
	},

	read: function(path, length, callback) {
		debug("i2c.readBytes(" + path + ", " + length + ")");
		if (!i2c.openPorts[path]) {
			throw new verror("I2C port " + path + " is not open. Please call i2c.open function to open it.");
		}
		var port = i2c.openPorts[path];
		port.read(length, callback);
	},

};