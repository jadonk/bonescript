Binary
======

Unpack multibyte binary values from buffers and streams.
You can specify the endianness and signedness of the fields to be unpacked too.

This module is a cleaner and more complete version of
[bufferlist](https://github.com/substack/node-bufferlist)'s binary module that
runs on pre-allocated buffers instead of a linked list.

Examples
========

parse.js
--------

    var buf = new Buffer([ 97, 98, 99, 100, 101, 102, 0 ]);
    
    var Binary = require('binary');
    var vars = Binary.parse(buf)
        .word16ls('ab')
        .word32bu('cf')
        .word8('x')
        .vars
    ;
    console.dir(vars);
-
    $ node parse.js
    { ab: 25185, cf: 1667523942, x: 0 }

stream.js
---------

    var Binary = require('binary');
    var stdin = process.openStdin();
    
    Binary.stream(stdin)
        .word32lu('x')
        .word16bs('y')
        .word16bu('z')
        .tap(function (vars) {
            console.dir(vars);
        })
    ;
-
    $ node examples/stream.js
    abcdefgh
    { x: 1684234849, y: 25958, z: 26472 }
    ^D

Methods
=======

Binary.parse(buf)
-----------------

Parse a static buffer in one pass. Returns a chainable interface with the
methods below plus a `vars` field to get at the variable stash as the last item
in a chain.

In parse mode, methods will set their keys to `null` if the buffer isn't big
enough except `buffer()` and `scan()` which read up up to the end of the buffer
and stop.

Binary.stream(emitter, eventName='data')
----------------------------------------

Parse a stream of buffer events from `eventName`. Each action will only execute
once enough data has arrived from the event emitter.

Binary(bufOrEm, eventName)
--------------------------

If `bufOrEm` is a Buffer, returns `Binary.parse(bufOrEm)`, else returns
`Binary.stream(bufOrEm, eventName)`

Binary.put()
------------

Returns a new [put object](http://github.com/substack/node-put).

word{8,16,32,64}{l,b}{e,u,s}(key)
----------------------------------

Parse bytes in the buffer or stream given:

* number of bits
* endianness ( l : little, b : big ),
* signedness ( u and e : unsigned, s : signed )

These functions won't start parsing until all previous parser functions have run
and the data is available.

The result of the parse goes into the variable stash at `key`.
If `key` has dots (`.`s), it refers to a nested address. If parent container
values don't exist they will be created automatically, so for instance you can
assign into `dst.addr` and `dst.port` and the `dst` key in the variable stash
will be `{ addr : x, port : y }` afterwards.

buffer(key, size)
-----------------

Take `size` bytes directly off the buffer stream, putting the resulting buffer
slice in the variable stash at `key`. If `size` is a string, use the value at
`vars[size]`. The key follows the same dotted address rules as the word
functions.

scan(key, buffer)
-----------------

Search for `buffer` in the stream and store all the intervening data in the
stash at at `key`, excluding the search buffer. If `buffer` passed as a string,
it will be converted into a Buffer internally.

For example, to read in a line you can just do:

    Binary(em)
        .scan('line', new Buffer('\r\n'))
        .tap(function (vars) {
            console.log(vars.line)
        })
    ;

tap(cb)
-------

The callback `cb` is provided with the variable stash from all the previous
actions once they've all finished.

You can nest additional actions onto `this` inside the callback.

into(key, cb)
-------------

Like `.tap()`, except all nested actions will assign into a `key` in the `vars`
stash.

loop(cb)
--------

Loop, each time calling `cb(end, vars)` for function `end` and the variable
stash with `this` set to a new chain for nested parsing. The loop terminates
once `end` is called.

flush()
-------

Clear the variable stash entirely.

Installation
============

To install with [npm](http://github.com/isaacs/npm):
 
    npm install binary

To run the tests with [expresso](http://github.com/visionmedia/expresso):

    expresso

Notes
=====

The word64 functions will only return approximations since javascript uses ieee
floating point for all number types. Mind the loss of precision.
