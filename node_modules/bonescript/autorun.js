// Copyright (C) 2013 - Texas Instruments, Jason Kridner
//
//
var fs = require('fs');
var child_process = require('child_process');
var winston = require('winston');

var ar = '/var/lib/cloud9/autorun';
var apps = {};

fs.exists(ar, arExists);

function arExists(exists) {
    if(!exists) fs.mkdir(ar, arWatch);
    else fs.readdir(ar, arFound);
}

function arFound(err, files) {
    if(err) {
        winston.err('Error reading directory: ' + err);
        arWatch();
        return;
    }
    var i = 0;
    arTestNext();

    function arTestNext() {
        if(i == files.length) {
            arWatch();
            return;
        }
        appStart(files[i]);
        i++;
        arTestNext();
    }
}

function appStart(file) {
    if(apps[file]) return;
    appTest();

    function appTest() {
        fs.exists(ar + '/' + file, appExists);
    }

    function appExists(exists) {
        if(exists) {
            if(file.match(/\.js$/)) {
                winston.info('start: ' + file);
                apps[file] = child_process.spawn(process.argv[0], [ar + '/' + file]);
                apps[file].on('close', appClosed);
                var onStdout = function(data) {
                    winston.info('stdout (' + file + '): ' + data);
                };
                var onStderr = function(data) {
                    winston.info('stderr (' + file + '):' + data);
                };
                apps[file].stdout.on('data', onStdout);
                apps[file].stderr.on('data', onStderr);
            }
        }
    }

    function appClosed(code, signal) {
        apps[file] = false;
        if(signal == 'SIGKILL') setTimeout(appTest, 1000);
    }
}

function arWatch() {
    fs.watch(ar, arWatcher);
}

function arWatcher(event, filename) {
    if(event == 'change') {
        winston.info('change: ' + filename);
        appStop(filename);
        appStart(filename);
    } else if(event == 'rename') {
        winston.info('rename: ' + filename);
        appStop(filename);
        appStart(filename);
    }
}

function appStop(file) {
    if(apps[file]) {
        winston.info('stop: ' + file);
        apps[file].kill('SIGKILL');
    }
}
