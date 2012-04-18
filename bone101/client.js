var scriptUrls = [
    '/socket.io/socket.io.js',
    '/jquery.js',
    '/slidy.js'                     // http://www.w3.org/Talks/Tools/Slidy2/scripts/slidy.js
];

// based loosely on http://stackoverflow.com/questions/950087/include-javascript-file-inside-javascript-file
for(url in scriptUrls) {
    var head = document.getElementsByTagName('head')[0];
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = scriptUrls[url];
    head.appendChild(script);
}

// based loosely on https://github.com/itchyny/browsershell/blob/master/main.js
var init = function() {
    try {
        $, io;
        var socket = new io.connect('');
        var $result = $('#result');
        var $textarea = $('textarea').focus();
        var view = function(s) {
            $textarea.val($textarea.val() + s);
            $textarea.scrollTop($textarea[0].scrollHeight);
            $textarea[0].selectionStart = $textarea[0].textLength;
        };
        var state = 'disconnected';
        socket.on('connect', function() {
            state = 'connected';
            view('connected\n');
        });
        socket.on('shell', function(m) {
            view(m + '\n');
        });
        socket.on('disconnect', function(m) {
            view('disconnected\n');
            init();
        });
        $textarea.keydown(function(e) {
            if(e.keyCode === 13) {
                var $textarea = $(this);
                if($textarea[0].selectionStart != $textarea[0].textLength) {
                    e.preventDefault();
                    $textarea.val($textarea.val() + '\n');
                    $textarea[0].selectionStart = $textarea[0].textLength;
                }
                setTimeout(function () {
                    var c = $textarea.val().split('\n').slice(-2)[0];
                    if(c.replace(/( |\n)+/g, '') === '') {
                        view('\n');
                    } else if(c.replace(/( |\n)+/g, '') === 'clear') {
                        $textarea.val('');
                        view('\n');
                    } else if(c.replace(/( |\n)+/g, '') === 'connect') {
                        init();
                    } else {
                        socket.emit('shell', c);
                    }
                }, 20);
            } else {
                $textarea.scrollTop($textarea[0].scrollHeight);
            }
        });
    } catch(ex) {
        setTimeout(init, 100);
    }
};

init();
