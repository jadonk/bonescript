var expect = require('chai').expect,
    b = require('../index');

describe('#serial', function() {

	it('opens serial port', function(done) {
		b.serial.open("/dev/ttyO1",{}, function(){

		}, function(err){
			done(err);
		});
	});
});