require('./lib/repl');


/** 
 * Use case 2
 */
var context = {
    href: 'http://firejune.com'
  , text: 'firejune.com'
};

var anchor = '<a href="{href}">{text}</a>';

console.log(anchor.repl(context));
//-> <a href="http://firejune.com">firejune.com</a>


/** 
 * Use case 2
 */

var chat = {
    user: "Firejune"
  , message: {
      text: "hello world"
    , date: "Fri Jul 16 16:58:46 +0000 2010"
  }
};

var row = [
    '<p>', 
      '<strong>{user}:</strong>',
      '<span>{message.text}</span>',
      '<em>{message.date}</em>',
    '</p>'
].join('');

console.log(row.repl(chat));
//-> <p><strong>Firejune:</strong><span>hello world</span><em>Fri Jul 16 16:58:46 +0000 2010</em></p>