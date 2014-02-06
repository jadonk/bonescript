function require(file) {
    throw 'Please perform setTargetAddress on a valid target';
}

function setTargetAddress(address, handlers) {
    var url = address;
    url = url.replace(/^(http:\/\/|https:\/\/)*/, 'http://');
    url = url.replace(/(\/)*$/, '/bonescript.js');
    loadScript(url, addHandlers);
    function loadScript(url, onload) {
        var head = document.getElementsByTagName('head')[0];
        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = url;
        script.charset = 'UTF-8';
        var scriptObj = head.appendChild(script);
        scriptObj.onload = onload;
    }
    function addHandlers() {
        if(typeof handlers == 'function') {
            handlers();
            return;
        }
        if(typeof _bonescript != 'undefined') {
            _bonescript.address = address;
            if(handlers.initialized) _bonescript.on.initialized = handlers.initialized;
            if(handlers.connect) _bonescript.on.connect = handlers.connect;
            if(handlers.connecting) _bonescript.on.connecting = handlers.connecting;
            if(handlers.disconnect) _bonescript.on.disconnect = handlers.disconnect;
            if(handlers.connect_failed) _bonescript.on.connect_failed = handlers.connect_failed;
            if(handlers.reconnect_failed) _bonescript.on.reconnect_failed = handlers.reconnect_failed;
            if(handlers.reconnect) _bonescript.on.reconnect = handlers.reconnect;
            if(handlers.reconnecting) _bonescript.on.reconnecting = handlers.reconnecting;
        }
        if(typeof handlers.callback == 'function') handlers.callback();
    }
}

setTargetAddress(192.168.7.2);
alert('got here');
