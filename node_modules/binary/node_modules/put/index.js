module.exports = Put;
function Put () {
    if (!(this instanceof Put)) return new Put;
    
    var words = [];
    var len = 0;
    
    this.put = function (buf) {
        words.push({ buffer : buf });
        len += buf.length;
        return this;
    };
    
    this.word8 = function (x) {
        words.push({ bytes : 1, value : x });
        len += 1;
        return this;
    };
    
    this.floatle = function (x) {
        words.push({ bytes : 'float', endian : 'little', value : x });
        len += 4;
        return this;
    };
    
    [ 8, 16, 24, 32, 64 ].forEach((function (bits) {
        this['word' + bits + 'be'] = function (x) {
            words.push({ endian : 'big', bytes : bits / 8, value : x });
            len += bits / 8;
            return this;
        };
        
        this['word' + bits + 'le'] = function (x) {
            words.push({ endian : 'little', bytes : bits / 8, value : x });
            len += bits / 8;
            return this;
        };
    }).bind(this));
    
    this.pad = function (bytes) {
        words.push({ endian : 'big', bytes : bytes, value : 0 });
        len += bytes;
        return this;
    };
    
    this.length = function () {
        return len;
    };
    
    this.buffer = function () {
        var buf = new Buffer(len);
        var offset = 0;
        words.forEach(function (word) {
            if (word.buffer) {
                word.buffer.copy(buf, offset, 0);
                offset += word.buffer.length;
            }
            else if (word.bytes == 'float') {
                // s * f * 2^e
                var v = Math.abs(word.value);
                var s = (word.value >= 0) * 1;
                var e = Math.ceil(Math.log(v) / Math.LN2);
                var f = v / (1 << e);
                console.dir([s,e,f]);
                
                console.log(word.value);
                
                // s:1, e:7, f:23
                // [seeeeeee][efffffff][ffffffff][ffffffff]
                buf[offset++] = (s << 7) & ~~(e / 2);
                buf[offset++] = ((e & 1) << 7) & ~~(f / (1 << 16));
                buf[offset++] = 0;
                buf[offset++] = 0;
                offset += 4;
            }
            else {
                var big = word.endian === 'big';
                var ix = big ? [ (word.bytes - 1) * 8, -8 ] : [ 0, 8 ];
                
                for (
                    var i = ix[0];
                    big ? i >= 0 : i < word.bytes * 8;
                    i += ix[1]
                ) {
                    if (i >= 32) {
                        buf[offset++] = Math.floor(word.value / Math.pow(2, i)) & 0xff;
                    }
                    else {
                        buf[offset++] = (word.value >> i) & 0xff;
                    }
                }
            }
        });
        return buf;
    };
    
    this.write = function (stream) {
        stream.write(this.buffer());
    };
}
