var Binary = require('../');
var EventEmitter = require('events').EventEmitter;
var assert = require('assert');

exports.eof = function () {
    var to = setTimeout(function () {
        assert.fail('never finished');
    }, 1000);
    
    var stream = new EventEmitter;
    Binary.stream(stream)
        .buffer('sixone', 5)
        .peek(function () {
            this.word32le('len');
        })
        .buffer('buf', 'len')
        .word8('x')
        .tap(function (vars) {
            clearTimeout(to);
            assert.eql(vars.sixone, new Buffer([ 6, 1, 6, 1, 6 ]));
            assert.eql(vars.buf.length, vars.len);
            assert.eql(
                [].slice.call(vars.buf),
                [ 9, 0, 0, 0, 97, 98, 99, 100, 101 ]
            );
            assert.eql(vars.x, 102);
        })
    ;
    
    var bufs = [
        new Buffer([ 6, 1, 6, 1, 6, 9, 0, 0, 0, 97 ]),
        new Buffer([ 98, 99 ]),
        new Buffer([ 100, 101, 102 ]),
    ];
    
    bufs.forEach(function (buf) {
        stream.emit('data', buf);
    });
    
    stream.emit('end');
};
