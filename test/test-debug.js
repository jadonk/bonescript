process.env.DEBUG = true;

var b = require('bonescript');
console.log('Name: ' + b.getPlatform().name);
console.log('Version: ' + b.getPlatform().bonescript);

