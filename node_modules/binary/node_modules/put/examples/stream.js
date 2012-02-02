#!/usr/bin/env node

var Put = require('put');
Put()
    .word16be(24930)
    .word32le(1717920867)
    .word8(103)
    .write(process.stdout)
;
