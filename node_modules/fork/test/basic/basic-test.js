/**
 * basic-test.js: Test if the required basic functions are working
 *
 * Copyright 2011 TTC/Sander Tolsma
 * See LICENSE file for license
 *
 * @author TTC/Sander Tolsma
 * @docauthor TTC/Sander Tolsma
 */

var assert = require('assert'),
    path = require('path'),
    vows = require('vows');
    
var helpers = require('../helpers');

vows.describe('basic/basic').addBatch({
  "When using node-fork with visible parameter but without customFds parameter": {
    topic: function() {
      var self = this,
          script = path.join(__dirname, '..', 'fixtures', 'basic-visible', 'fork.js'),
          child = helpers.createParent({script: script});
          
      setTimeout(function(){
        if (!child) return self.callback('Child not created!');
        self.callback(null, child);
      }, 500);
    },
    "it should be properly created": function(err, child) {
      assert.isTrue(!!child);
      assert.equal(child.testing.stdout[0], 'The child says:  I am alive!\n');
      assert.equal(child.testing.stdout[1], 'The parent says:  This is your parent!\n');
      assert.equal(child.testing.stderr[2], 'undefined\n');
    }
  },
  
  
  "When using node-fork without visible parameter and customFds parameter": {
    topic: function() {
      var self = this,
          script = path.join(__dirname, '..', 'fixtures', 'basic-invisible', 'fork.js'),
          child = helpers.createParent({script: script});
          
      setTimeout(function(){
        if (!child) return self.callback('Child not created!');
        self.callback(null, child);
      }, 500);
    },
    "it should be properly created": function(err, child) {
      assert.isTrue(!!child);
      assert.equal(child.testing.stdout[0], 'The child says:  I am alive!\n');
      assert.equal(child.testing.stdout[1], 'The parent says:  This is your parent!\n');
      assert.equal(child.testing.stderr[2], 'undefined\n');
    }
  },
  
  
  "When using node-fork for a child without visible parameter but with customFds parameter": {
    topic: function() {
      var self = this,
          script = path.join(__dirname, '..', 'fixtures', 'basic-invisible', 'child.js'),
          child = helpers.createChild({script: script, customFds: [-1, -1, -1]});
      
      child.send('This is your parent!');
          
      setTimeout(function(){
        if (!child) return self.callback('Child not created!');
        self.callback(null, child);
      }, 500);
    },
    "it should be properly created": function(err, child) {
      assert.isTrue(!!child);
      assert.equal(child.testing.stdout[0], 'The parent says:  This is your parent!\n');
      assert.equal(child.testing.stderr[2], 'undefined\n');
    }
  },
  
  
  "When using node-fork for a child with visible and customFds parameter": {
    topic: function() {
      var self = this,
          script = path.join(__dirname, '..', 'fixtures', 'basic-visible', 'child.js'),
          child = helpers.createChild({script: script, visible: true, customFds: [-1, -1, -1]});
      
      child.send('This is your parent!');
          
      setTimeout(function(){
        if (!child) return self.callback('Child not created!');
        self.callback(null, child);
      }, 500);
    },
    "it should be properly created": function(err, child) {
      assert.isTrue(!!child);
      assert.equal(child.testing.stdout[0], 'The parent says:  This is your parent!\n');
      assert.equal(child.testing.stderr[2], 'undefined\n');
    }
  }
}).export(module);