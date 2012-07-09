# systemd for Node.js

  Adds support for running node.js as a socket-activated service under systemd.
  
  For more background on socket activation: http://0pointer.de/blog/projects/socket-activation.html

  Obviously, this will only work on Linux distributions with systemd (such as Fedora).

  Developed by Flow Pilots: http://www.flowpilots.com/

## Usage
  
  You can install the latest version via npm:
  
    $ npm install systemd

  Require the systemd module and pass 'systemd' as a parameter to listen():

    require('systemd');

    var http = require('http');
    http.createServer(function (req, res) {
        res.writeHead(200, {'Content-Type': 'text/plain'});
        res.end('Hello World\n');
    }).listen('systemd');
  
  Install a systemd socket file (e.g.: /etc/systemd/system/node-hello.socket):

    [Socket]
    ListenStream=1337

    [Install]
    WantedBy=sockets.target

  Install a systemd service file (e.g.: /etc/systemd/system/node-hello.service):

    # Adjust according to man 5 systemd.exec

    [Service]
    ExecStart=/path/to/bin/node /path/to/hello.js
    StandardOutput=syslog
    User=nobody
    Group=nobody

  Be sure to subtitute the paths to node and your script!

  Enable and start the socket:

    systemctl enable node-hello.socket
    systemctl start node-hello.socket

  Check the status of the socket:

    # systemctl status node-hello.socket
    node-hello.socket
          Loaded: loaded (/etc/systemd/system/node-hello.socket)
          Active: active (listening) since Sat, 15 Oct 2011 20:27:47 +0200; 2s ago
          CGroup: name=systemd:/system/node-hello.socket

  Great, it's running!

  Enable the service:

    systemctl enable node-hello.service

  Check the status, not running yet:

    # systemctl status node-hello.service
    node-hello.service
          Loaded: loaded (/etc/systemd/system/node-hello.service)
          Active: inactive (dead)
          CGroup: name=systemd:/system/node-hello.service

  Do a request to your service:

    # curl -i http://localhost:1337/
    HTTP/1.1 200 OK
    Content-Type: text/plain
    Connection: keep-alive
    Transfer-Encoding: chunked
    
    Hello World

  Check again, now it will be running:

    # systemctl status node-hello.service
    node-hello.service
          Loaded: loaded (/etc/systemd/system/node-hello.service)
          Active: active (running) since Sat, 15 Oct 2011 20:32:10 +0200; 38s ago
        Main PID: 1159 (node)
          CGroup: name=systemd:/system/node-hello.service
                  └ 1159 /path/to/bin/node /path/to/hello.js

## Only listen to systemd when running under systemd

  You can make the systemd usage conditional by checking for the systemd environment variable:

    var http = require('http');
    
    require('systemd');
    
    var port = process.env.LISTEN_PID > 0 ? 'systemd' : 1337;
    http.createServer(function (req, res) {
        res.writeHead(200, {'Content-Type': 'text/plain'});
        res.end('Hello World\n');
    }).listen(port);

  This makes it possible to run the script stand-alone in development, yet use systemd when started through systemd.
    
## License 

    (The MIT License)

    Copyright (C) 2011-2012 by Ruben Vermeersch <ruben@savanne.be>

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in
    all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
    THE SOFTWARE.
