var expect = require('chai').expect,
    b = require('../index');

describe('#watchdog', function() {
	before("starts watchdog timer",function(){
    	b.watchdog.start();
  	});

	it('stops watchdog timer', function() {
		b.watchdog.stop();
	});
});