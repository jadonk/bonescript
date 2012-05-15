/**
 * fork.js: backported child_process.fork() function from nodejs 0.5.x
 * for nodejs 0.4.x and 0.6.x
 *
 * Copyright 2011 TTC/Sander Tolsma
 * See LICENSE file for license
 *
 * Copyright Joyent, Inc. and other Node contributors.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to permit
 * persons to whom the Software is furnished to do so, subject to the
 * following conditions:
 *
 * The above copyright notice and this permission notice shall be included
 * in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
 * OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
 * NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
 * DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
 * OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
 * USE OR OTHER DEALINGS IN THE SOFTWARE.
 *
 */

var child_process = require('child_process');

//
// We can always require `./shim` so expose it for 
// `v0.6.x -> v0.4.x` communication
//
exports.shim = require('./shim');

//
// If `child_process.fork` is defined then it is safe to 
// require `./native` for `v0.6.x -> v0.6.x` communication.
//
if (child_process.fork) {
  exports.native = require('./native');
}

//
// Test which fork module version to use. We can force a child process
// running `node@v0.6.x` to use the shim by setting `FORK_SHIM`. 
//
exports.fork = !child_process.fork || process.env.FORK_SHIM
  ? exports.shim.fork
  : exports.native.fork;

// 
// Execute the following code at module or child startup in order to be 
// able to receive messages from the parent process. 
// If we were spawned with env.FORK_CHANNEL_FD and don't have a 
// process.send function (i.e in node 4.x mode) then get that var and start
// parsing data from the given stream.
// 
if (!process.send && process.env.FORK_CHANNEL_FD) {
  exports.shim.clientInitialize();
  
  // Rewrite `process.argv` so that `Module.runMain()` will transparently
  // locate and run the target script and it will be completely unaware
  // of this module when started in 'invisible' mode.
  if (process.argv[1] === __filename) {
    process.argv.splice(1, 1);
  
    // Clear the module cache so anything required is reloaded as necessary.
    require('module').Module._cache = {};
  
    // Next tick to prevent a leak from function arguments or the call stack
    process.nextTick(function () {
      var script = process.argv[1];
      // require.resolve acts funny, need to massage a little
      process.argv[1] = require('path').resolve(process.cwd(), script);
      require('module').Module.runMain();
    });
  }
}