// Copyright (C) 2013 - Texas Instruments, Jason Kridner
//
//
var fs = require('fs');
var child_process = require('child_process');
var winston = require('winston');
var events = require('events');
var chokidar = require('chokidar');

var debug = process.env.DEBUG ? true : false;
var apps = {};
var watchers = [];
var emitter = new events.EventEmitter();

var autorun = function (dir) {
    var ar = dir || '/var/lib/cloud9/autorun';

    winston.info('Starting bonescript autorun service');

    fs.exists(ar, arExists);

    function arExists(exists) {
        if (!exists) fs.mkdir(ar, arWatch);
        else fs.readdir(ar, arFound);
    }

    function arFound(err, files) {
        if (err) {
            winston.err('Error reading directory: ' + err);
            arWatch();
            return;
        }
        var i = 0;
        arTestNext();

        function arTestNext() {
            if (i == files.length) {
                arWatch();
                return;
            }
            if (debug) winston.debug("arTestNext: files[" + i + "] = " + ar + '/' + files[i]);
            appStart(ar + '/' + files[i]);
            i++;
            arTestNext();
        }
    }

    function appStart(file) {
        if (apps[file]) {
            if (debug) winston.debug("already started: " + file);
            return;
        }
        appTest();

        function appTest() {
            fs.exists(file, appExists);
        }

        function appExists(exists) {
            function onStdout(data) {
                winston.info('stdout (' + file + '): ' + data);
            }

            function onStderr(data) {
                winston.info('stderr (' + file + '):' + data);
            }

            if (exists) {
                if (typeof apps[file] != 'undefined') {
                    winston.info('already running: ' + file);
                    return;
                }

                if (file.match(/\.js$/)) {
                    winston.info('start: ' + file);
                    apps[file] = child_process.spawn(process.argv[0], [file]);
                    apps[file].on('close', appClosed);
                    apps[file].stdout.on('data', onStdout);
                    apps[file].stderr.on('data', onStderr);
                } else if (file.match(/\.py$/)) {
                    winston.info('start: ' + file);
                    apps[file] = child_process.spawn('/usr/bin/python', [file]);
                    apps[file].on('close', appClosed);
                    apps[file].stdout.on('data', onStdout);
                    apps[file].stderr.on('data', onStderr);
                } else if (file.match(/\.sh$/)) {
                    winston.info('start: ' + file);
                    apps[file] = child_process.spawn('/bin/bash', [file]);
                    apps[file].on('close', appClosed);
                    apps[file].stdout.on('data', onStdout);
                    apps[file].stderr.on('data', onStderr);
                } else if (file.match(/\.ino$/)) {
                    winston.info('start: ' + file);
                    apps[file] = child_process.spawn('/usr/bin/make', [
                        "-f",
                        "/var/lib/cloud9/extras/Userspace-Arduino/Makefile",
                        "TARGET=" + file.replace(/\.ino$/, ''),
                        "LOCAL_INO_SRCS=" + file,
                        "LOCAL_C_SRCS=",
                        "LOCAL_CPP_SRCS=",
                        "LOCAL_PDE_SRCS=",
                        "LOCAL_AS_SRCS=",
                        "COMMON_DEPS="
                    ], {
                        'cwd': ar
                    });
                    apps[file].on('close', appClosed);
                    apps[file].stdout.on('data', onStdout);
                    apps[file].stderr.on('data', onStderr);
                }
                emitter.emit('start', file);
            }
        }

        function appClosed(code, signal) {
            winston.info("closed: " + file);
            delete apps[file];
            emitter.emit('closed', file);
            //setTimeout(appTest, 1000);
        }
    }

    function arWatch() {
        if (debug) winston.debug("arWatch: " + ar);
        var w = chokidar.watch(ar, {
            persistent: true
        });
        w.on('add', arAdd);
        w.on('change', arChange);
        w.on('unlink', appStop);
        watchers.push(w);
    }

    function arAdd(filename) {
        winston.info('add: ' + filename);
        appStart(filename);
    }

    function arChange(filename) {
        winston.info('change: ' + filename);
        appStop(filename);
        appStart(filename);
    }

    function appStop(file) {
        if (debug) {
            for (var x in apps) {
                winston.debug('running: ' + x);
            }
        }
        if (typeof apps[file] != 'undefined') {
            emitter.emit('stop', file);
            winston.info('stop: ' + file + ' (pid: ' + apps[file].pid + ')');
            apps[file].kill('SIGTERM');
        } else {
            winston.info('already stopped: ' + file);
        }
    }

    return ({
        getApps: function () {
            return (apps);
        },
        getEmitter: function () {
            return (emitter);
        },
        stop: function () {
            for (var app in apps) {
                appStop(app);
            }
            for (var w in watchers) {
                watchers[w].close();
            }
        }
    });
};

module.exports = {
    autorun: autorun
};