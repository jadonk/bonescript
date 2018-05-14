// Copyright (C) 2013 - Texas Instruments, Jason Kridner
//
//
var fs = require('fs');
var child_process = require('child_process');
var winston = require('winston');
var events = require('events');
var chokidar = require('chokidar');

var debug = process.env.DEBUG ? true : false;

var autorun = function (dir) {
    var ar = dir || '/var/lib/cloud9/autorun';
    var apps = {};
    var watchers = [];
    var emitter = new events.EventEmitter();

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
            if (debug) winston.debug("arTestNext: files[" + i + "] = " + files[i]);
            if (i == files.length) {
                arWatch();
                return;
            }
            appStart(files[i]);
            i++;
            arTestNext();
        }
    }

    function appStart(file) {
        if (apps[file]) return;
        appTest();

        function appTest() {
            fs.exists(ar + '/' + file, appExists);
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
                    apps[file] = child_process.spawn(process.argv[0], [ar + '/' + file]);
                    apps[file].on('close', appClosed);
                    apps[file].stdout.on('data', onStdout);
                    apps[file].stderr.on('data', onStderr);
                } else if (file.match(/\.py$/)) {
                    winston.info('start: ' + file);
                    apps[file] = child_process.spawn('/usr/bin/python', [ar + '/' + file]);
                    apps[file].on('close', appClosed);
                    apps[file].stdout.on('data', onStdout);
                    apps[file].stderr.on('data', onStderr);
                } else if (file.match(/\.sh$/)) {
                    winston.info('start: ' + file);
                    apps[file] = child_process.spawn('/bin/bash', [ar + '/' + file]);
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
            delete apps[file];
            emitter.emit('closed', file);
            setTimeout(appTest, 1000);
        }
    }

    function arWatch() {
        if (debug) winston.debug("arWatch: " + ar);
        var w = chokidar.watch(ar, { persistent: true });
        w.on('add', arAdd);
        w.on('change', arChange);
        w.on('unlink', appStop);
        if (debug) winston.debug("Watching: " + JSON.stringify(w.getWatched()));
        watchers.push(w);
    }

    function arAdd (filename) {
        winston.info('start: ' + filename);
        appStart(filename);
    }

    function arChange (filename) {
        winston.info('change: ' + filename);
        appStop(filename);
        appStart(filename);
    }

    function appStop(file) {
        if (typeof apps[file] != 'undefined') {
            winston.info('stop: ' + file + ' (pid: ' + apps[file].pid + ')');
            apps[file].kill('SIGTERM');
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
            for (var w in watchers) {
                watchers[w].close();
            }
        }
    });
};

module.exports = {
    autorun: autorun
};
