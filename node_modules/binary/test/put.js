var assert = require('assert');
var Binary = require('../');

exports.builder = function () {
    var buf = Binary.put()
        .word16be(1337)
        .put(new Buffer([ 7, 8, 9 ]))
        .buffer()
    ;
    assert.eql(buf, new Buffer([ 0x05, 0x39, 0x07, 0x08, 0x09 ]));
};
