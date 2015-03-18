var expect = require('chai').expect,
    b = require('../index');

describe('#pinModeSync', function() {

	it('tests sync version of pinmode', function() {
		b.pinModeSync("P8_13", b.ANALOG_OUTPUT);
		b.pinModeSync("P8_13", b.OUTPUT);
	});
});