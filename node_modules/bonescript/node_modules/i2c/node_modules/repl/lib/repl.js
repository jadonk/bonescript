/*!
 * Template - simple template engine
 *
 * Copyright(c) 2011 Firejune <to@firejune.com>
 * MIT Licensed
 */


/**
 * Repl method.
 */

String.prototype.repl = function(dic, parentKey) {

  var src = this;
  for (var key in dic) {
    var _key = (parentKey ? parentKey + '.' : '') + key;
    if (typeof dic[key] == 'object') src = src.repl(dic[key], _key);
    else src = src.replace(new RegExp('{' + _key + '}', 'g'), dic[key]);
  }

  return src;
};
