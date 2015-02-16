var expect = require('chai').expect,
    b = require('../index');

describe('#digitalRead', function() {
	before("setting P9_42 to digital input pin",function(done){
    	b.pinMode("P9_42", b.INPUT,done);
  	});

	it('reads digital input pin P9_42 ', function(done) {
		b.digitalRead("P9_42", function(err, value) {
			expect(value).to.be.within(0,1);
			done(err);
		});
	});
});

describe('#digitalWrite', function() {
	before("setting P9_41 and USR0 to digital output pin",function(done){
    	b.pinMode("P9_41", b.OUTPUT, function(){
    		b.pinMode("USR0", b.OUTPUT, done);
    	});
  	});

	it('writes digital pin P9_41 and USR0 ', function(done) {
		b.digitalWrite("P9_41", b.HIGH, function(err) {
			b.digitalWrite("USR0", b.HIGH, done);
		});
	});

	it('writes digital pin P9_41 sync', function() {
		b.digitalWriteSync("P9_41", b.HIGH);
	});
});