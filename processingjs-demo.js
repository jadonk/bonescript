#!/usr/bin/env node
// Copyright (C) 2010 Texas Instruments, Jason Kridner
var sys = require('sys'); 
var http = require('http');
var fs = require('fs');
var url = require('url');
var child_process = require('child_process');
var path = require('path');
var events = require('events');
var io = require('socket.io');
var binary = require('binary');
var buffer = require('buffer');

// hack
if(!("" + process.cwd()).match(/labs\/processing-js$/)) {
 sys.puts("Changing directory from " + process.cwd());
 process.chdir('labs/processing-js');
}

// Serve web page and notify user
function loadFile(uri, res, type) {
 var filename = path.join(process.cwd(), uri);
 path.exists(
  filename,
  function(exists) {
   if(!exists) {
    res.writeHead(404, {"Content-Type": "text/plain"});
    res.write("404 Not Found\n");
    res.end();
    return;
   }
   fs.readFile(
    filename,
    encoding='utf8',
    function(err, file) {
     if(err) {
      res.writeHead(500, {"Content-Type": "text/plain"});
      res.write(err + "\n");
      res.end();
      return;
     }
     res.writeHead(200, {"Content-Type": type});
     var str = ("" + file).replace("<!--%OUTPUT%-->", "");
     res.write(str);
     res.end();
    }
   );
  }
 );
}

sys.puts('Creating server');
var server = http.createServer(
 function(req, res) {
  var uri = url.parse(req.url).pathname;
  sys.puts("Got request for " + uri);
  if(uri == '/') {
   loadFile('/index.html', res, "text/html");
  } else {
   if (uri.match(/\.js$/)) {
    sys.puts("Got request for a JavaScript file.");
    loadFile(uri, res, "text/javascript");
   } else {
    loadFile(uri, res, "text/html");
   }
  }
 }
);

if(!server.listen(3001)) {
 sys.puts('Server running');
} else {
 sys.puts('Server failed to connect to socket');
}

// socket.io 
var socket = io.listen(server)
socket.on('connection', function(client) {
 // new client is here! 
 sys.puts("New client connected");

 // initiate read
 try {
  var child = child_process.spawn(
   "/usr/bin/arecord",
   [
    "-c1", "-r8000", "-fS8", "-traw", 
    "--buffer-size=200", "--period-size=200", "-N"
   ]
  );
  child.stdout.setEncoding('base64');
  child.stdout.on('data', function(data) {
   client.send(data);
  });
  child.stderr.on('data', function(data) {
   sys.puts("arecord: " + data);
  });
  child.on('exit', function(code) {
   sys.puts("arecord exited with value " + code);
  });
 } catch(err) {
  sys.puts("arecord error: " + err);
 }
 
 // on message
 client.on('message', function(data) {
  sys.puts("Got message from client:", data);
  if(data.match(/trigger/)) {
   child_process.exec(
    "play -b1 -c1 -r8000 -n synth 10 sine create 200-800 0 0 vol 0.05",
    function (err, stdout, stderr) {}
   );
  }
 });
 
 // on disconnect
 client.on('disconnect', function() {
  child.kill('SIGHUP');
  sys.puts("Client disconnected.");
 }); 
}); 

