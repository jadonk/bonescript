var b = require('bonescript');

var directory = (process.env.AUTORUN_DIR) ? process.env.AUTORUN_DIR : '/var/lib/cloud9/autorun';

b.autorun(directory);