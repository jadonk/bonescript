/**
 * The child side example of the use of fork. 
 *
 * Copyright 2011 TTC/Sander Tolsma
 * See LICENSE file for license
 *
 * @author TTC/Sander Tolsma
 * @docauthor TTC/Sander Tolsma
 */

require('../../../lib/fork');

process.on('message', function(msg) {
  console.log('The parent says: ', msg);
  process.nextTick(function() {
    process.exit(0);
  });
});

process.send({ hello: 'I am alive!'});

console.error(process.argv[0]);
console.error(process.argv[1]);
console.error(process.argv[2]);
