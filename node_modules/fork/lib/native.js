/**
 * native.js: changed child_process.fork() function from nodejs 0.6.x
 * for nodejs 0.6.x
 *
 * Copyright 2011 TTC/Sander Tolsma
 * See LICENSE file for license
 *
 * (C) 2010 Nodejitsu Inc.
 * MIT LICENCE
 *
 */

var nodeFork = require('child_process').fork;

//
// This is an unfortunate hack (created by mmalecki !!) which works around a inconsistency
// in the `child_process` APIs in node.js core as of `v0.6.6`. Pull-request is open to resolve the issue.
//
// https://github.com/joyent/node/pull/2454
//
// Until then, setup `options.customFds` to return null when defined in options.
//
exports.fork = function fork(modulePath, args, options) {
  var hackedOptions = {},
      execPath = process.execPath,
      child;
  
  options = options || {};
    
  if (typeof options === 'object') {
    Object.keys(options).forEach(function (key) {
      hackedOptions[key] = options[key];
    });
  }
  
  delete hackedOptions.customFds;
  Object.defineProperty(hackedOptions, 'customFds', {
    get: function () {
      return null;
    },
    set: function () {
      //
      // Do nothing, ignore the attempt to overwrite here:
      // https://github.com/joyent/node/blob/master/lib/child_process.js#L172
      //
    }
  });
  
  // be forward compatible with the 2454 pull request so always ask child without stdout/stderr pipe
  hackedOptions.silent = true;
  
  if (options.command) {
    process.execPath = options.command;
  }
  
  child = nodeFork(modulePath, args, hackedOptions);
  process.execPath = execPath;
  
  // if no customfds and not silent then pipe child stdout/stderr to parent stdout/stderr
  if (!options.customFds && !options.silent) {
    child.stdout.pipe(process.stdout, { end: false });
    child.stderr.pipe(process.stderr, { end: false });
  }
  
  return child;
};

/**
 * Execute the following code at module or child startup when process.send is not
 * available. Will not happen in node 0.6 so empty!!
 */
exports.clientInitialize = function clientInitialize() {
};