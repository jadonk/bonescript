/**
 * helpers.js: Test helpers.
 *
 * Copyright 2011 TTC/Sander Tolsma
 * See LICENSE file for license
 *
 * @author TTC/Sander Tolsma
 * @docauthor TTC/Sander Tolsma
 */

var spawn = require('child_process').spawn,
    fork = require('../lib/fork').fork,
    helpers = exports;

helpers.createChild = function(options) {
  var child,
      forkOptions = {};
  
  if (options.visible) forkOptions.visible = options.visible;
  if (options.customFds) forkOptions.customFds = options.customFds;
  
  try {
    child = fork(options.script, options.args, forkOptions);
  } catch (err) {
    return
  }

  child.testing = {};
  child.testing.stdout = options.stdout || [];
  child.testing.stderr = options.stderr || [];
  
  // Hook all stream data and process it
  function listenTo(stream) {
    function ldata(data) {
      child.testing[stream].push(data+'');
    }

    child[stream].on('data', ldata);

    child.on('exit', function() {
      child[stream].removeListener('data', ldata);
    });
  }

  if (options.customFds) {
    // Listen to stdout and stderr
    listenTo('stdout');
    listenTo('stderr');
  }
  
  return child;
}


helpers.createParent = function(options) {
  var spawnOptions = {customFds: [-1, -1, -1]},
      args = [options.script],
      child;

  try {
    // spawn the parent process to test
    child = spawn(process.execPath, args, spawnOptions);
  } catch (err) {
    return;
  }

  child.testing = {};
  child.testing.stdout = options.stdout || [];
  child.testing.stderr = options.stderr || [];
  
  // Hook all stream data and process it
  function listenTo(stream) {
    function ldata(data) {
      child.testing[stream].push(data+'');
    }

    child[stream].on('data', ldata);

    child.on('exit', function() {
      child[stream].removeListener('data', ldata);
    });
  }

  // Listen to stdout and stderr
  listenTo('stdout');
  listenTo('stderr');
  
  return child;
}