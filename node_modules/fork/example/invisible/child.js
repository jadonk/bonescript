/**
 * The child side example of the use of fork. 
 *
 * Copyright 2011 TTC/Sander Tolsma
 * See LICENSE file for license
 *
 * @author TTC/Sander Tolsma
 * @docauthor TTC/Sander Tolsma
 */

process.on('message', function(msg) {
  console.log('The parent says: ', msg);
  process.nextTick(function() {
    process.exit(0);
  });
});

process.send({ hello: 'I am alive!'});
