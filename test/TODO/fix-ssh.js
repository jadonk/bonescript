var b = require('bonescript');

b.getPlatform(onGetPlatform);

function onGetPlatform(x) {
    if(!x.name || !x.serialNumber || !x.version)
        err('getPlatform returned ' + JSON.stringify(x));
    console.log('Name = ' + x.name);
    console.log('S/N = ' + x.serialNumber);
    console.log('Version = ' + x.version);
    console.log('BoneScript version = ' + x.bonescript);
    b.setDate(Date().toString(), onSetDate);
}

function onSetDate(x) {
    b.socket.on('shell', onShell);
    b.socket.emit('shell', '\n');
    b.socket.emit('shell', 'rm /etc/dropbear/dropbear_rsa_host_key\n');
    //b.socket.emit('shell', 'systemctl --system daemon-reload\n');
    b.socket.emit('shell', 'systemctl stop dropbear.socket\n');
    b.socket.emit('shell', '/etc/init.d/dropbear stop\n');
    b.socket.emit('shell', '/etc/init.d/dropbear start\n');
    //b.socket.emit('shell', 'systemctl status dropbear.socket\n');
    b.socket.emit('shell', 'journalctl -f\n');
    setTimeout(complete, 10000);
    //complete();
}

function onShell(x) {
    console.log('shell: ' + x);
    //if(x.indexOf('Listening on dropbear.socket') >= 0)
        //complete();
}

function complete() {
    console.log('***PASS***');
    process.exit(0);
}

function err(x) {
    console.log('***FAIL*** ' + x);
    throw(x);
}

function printJSON(x) {
    console.log('x = ' + JSON.stringify(x));
}
