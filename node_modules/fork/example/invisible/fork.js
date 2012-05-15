/**
 * The parent side example of the use of fork. 
 *
 * Copyright 2011 TTC/Sander Tolsma
 * See LICENSE file for license
 *
 * @author TTC/Sander Tolsma
 * @docauthor TTC/Sander Tolsma
 */

var path = require('path'),
    inspect = require('util').inspect,
    fork = require('../../lib/fork').fork;

var child;

try {
  child = fork(path.join(__dirname, 'child.js'));
} catch (err) {
  console.log('Error forking child: ', inspect(err), err.stack);
  process.exit(1);
}

child.on('message', function(msg) {
  console.log('The child says: ', msg.hello);
});

child.send('This is your parent!');