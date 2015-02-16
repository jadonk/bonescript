var expect = require('chai').expect,
    b = require('../index');

describe('#analog', function() {
	before("setting P8_13 to analog output pin",function(done){
    	b.pinMode("P8_13", b.ANALOG_OUTPUT, done);
  	});

	it('reads analog input pin P9_40', function(done) {
		b.digitalRead("P9_40", function(err, value) {
			expect(value).to.be.within(0,1);
			done(err);
		});
	});

	it('writes analog value to pin P8_13', function(done) {
		b.analogWrite("P8_13", 0.5, 2000, done);
	});

	it('stops analog output on pin P8_13', function(done) {
		b.stopAnalog("P8_13", done);
	});

	it('starts analog output on pin P8_13', function(done) {
		b.startAnalog("P8_13", done);
	});
});