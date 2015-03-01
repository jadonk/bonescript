var expect = require('chai').expect,
    b = require('../index');

describe('#interrupt', function() {
	before("attaches interrupt to pin P9_41",function(done){
    	b.attachInterrupt("P9_41", b.RISING, function(data){

    	}, function(err){
    		done(err);
    	});
  	});

	it('detatches interrupt from pin P9_41', function(done) {
		b.detachInterrupt("P9_41", function(err){
			done(err);
		});
	});
});