var expect = require('chai').expect,
    b = require('../index');

describe('#i2c', function() {

	it('opens i2c port', function(done) {
		b.i2c.open("/dev/i2c-1", 0x18 , function(){

		}, function(err){
			done(err);
		});
	});
});