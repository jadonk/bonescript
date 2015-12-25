var expect = require('chai').expect,
    b = require('../index');

describe('#interrupt', function() {
	before("attaches interrupt to pin P8_07",function(done){
    	b.attachInterrupt("P8_07", b.RISING, function(data){

    	}, function(err){
    		done(err);
    	});
  	});

	it('detatches interrupt from pin P8_07', function(done) {
		b.detachInterrupt("P8_07", function(err){
			done(err);
		});
	});
});
