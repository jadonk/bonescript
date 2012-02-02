var assert = require('assert');
var Put = require('put');
var Binary = require('binary');

exports.chain = function () {
    var buf = Put()
        .word16be(1337)
        .word8(1)
        .pad(5)
        .put(new Buffer('pow', 'ascii'))
        .word32le(9000)
        .word64le(3)
        .word64be(4)
        .buffer()
    ;
    assert.equal(buf.length, 2 + 1 + 5 + 3 + 4 + 8 + 8);
    var bs = [].slice.call(buf);
    
    // word16be(1337)
    assert.eql(bs.slice(0,2), [ 0x05, 0x39 ]);
    
    // word8(1)
    assert.eql(bs.slice(2,3), [ 0x01 ]);
    
    // pad(5)
    assert.eql(bs.slice(3,8), [ 0x00, 0x00, 0x00, 0x00, 0x00 ]);
    
    // put(new Buffer('pow', 'ascii'))
    assert.eql(bs.slice(8,11), [ 0x70, 0x6f, 0x77 ]);
    
    // word32le(9000)
    assert.eql(bs.slice(11,15), [ 0x28, 0x23, 0x00, 0x00 ]);
    
    // word64le(3)
    assert.eql(
        bs.slice(15,23),
        [ 0x03, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00 ]
    );
    
    // word64be(4)
    assert.eql(
        bs.slice(23,31),
        [ 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x04 ]
    );
};

exports.parity = function () {
    [ 'le', 'be' ].forEach(function (end) {
        [ 8, 16, 32 ].forEach(function (n) {
            var max = Math.pow(2,n);
            var step = Math.max(1, Math.floor(max / 1000));
            
            for (var i = 0; i < max; i += step) {
                var buf = Put()[ 'word' + n + end ](i).buffer();
                var j = Binary.parse(buf)[ 'word' + n + end ]('j').vars.j;
                assert.eql(i, j);
            }
        });
    });
};

exports.b64 = function () {
    var buf = Put().word64be(1).buffer();
    assert.eql([].slice.call(buf), [ 0, 0, 0, 0, 0, 0, 0, 1 ]);
};

exports.l64 = function () {
    var buf = Put().word64le(1).buffer();
    assert.eql([].slice.call(buf), [ 1, 0, 0, 0, 0, 0, 0, 0 ]);
};
