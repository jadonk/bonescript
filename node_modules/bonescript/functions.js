//
// Copyright (C) 2012 - Cabin Programs, Ken Keller 
//
// Permission is hereby granted, free of charge, to any person obtaining a copy of
// this software and associated documentation files (the "Software"), to deal in
// the Software without restriction, including without limitation the rights to
// use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
// of the Software, and to permit persons to whom the Software is furnished to do
// so, subject to the following conditions:
// 
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
// 
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.
//
// Bits and Bytes
//    lowByte(value)
//    highByte(value)
//    bitRead(value, bitnum)
//    bitWrite(value, bitnum, bitdata) 
//    bitSet(value, bitnum) 
//    bitClear(value, bitnum) 
//    bit(bitnum)
//
// Trigonometry
//    sin(radians)
//    cos(radians)
//    tan(radians)
//
//  Math
//    min(x,y)
//    max(x,y)
//    abs(x)
//    constrain(x, a, b)
//    map(value, fromLow, fromHigh, toLow, toHigh)
//    pow(x, y)
//    sqrt(x)
//
//  Random Numbers
//    randomSeed(x)
//    random(min, max)
//    random(max)
//


// Returns the lower 8 bits of  value
exports.lowByte = function(value) {
    return ( value & 0x0ff);
};

// Returns the value shifted right by 8 bits
exports.highByte = function(value) {
    return ( exports.lowByte(value >>8));
};

// Returns the value of the bit number specified (return:0 or 1) 
exports.bitRead = function(value, bitnum) {
    return ((value>>bitnum)&0x01);
};

// Returns value with bit changed to specified data 
exports.bitWrite = function(value, bitnum, bitdata) {
    value = value & ~(0x01<<bitnum);
    bitdata = (bitdata & 0x01) << bitnum;
    return (value | bitdata);
};

// Returns value with specified bit set
exports.bitSet = function(value, bitnum) {
    return(value | (0x01 << bitnum));
};

// Returns value with specified bit clear
exports.bitClear = function(value, bitnum) {
    return(value & (~(0x01 << bitnum)));
};

//Returns a value with one specified bit number set
exports.bit = function(bitnum) {
    return(0x01<<bitnum);
};

// Returns the sine of an angle (in radians). 
exports.sin = function(radians) {
    return (Math.sin(radians));
};

// Returns the cos of an angle (in radians). 
exports.cos = function(radians) {
    return (Math.cos(radians));
};

// Returns the tan of an angle (in radians). 
exports.tan = function(radians) {
    return (Math.tan(radians));
};

// Returns the the minimum of x or y
exports.min = function(x,y) {
    return (Math.min(x,y));
};

// Returns the the maximum of x or y
exports.max = function(x,y) {
    return (Math.max(x,y));
};

// Returns the the absolute value of x
exports.abs = function(x) {
    return (Math.abs(x));
};

// Returns a value constrained within the range of a to b
// Returns: x if x is between a and b
//          a if x is less than a
//          b if x is greater than b 
exports.constrain = function(x,a,b) {
    if (x>b) x=b;
    else if (x<a) x=a;
    return (x);
};

// Returns a value re-mapped from one range to another
exports.map = function(value, fromLow, fromHigh, toLow, toHigh) {
    return( toLow + (((value-fromLow)*(toHigh-toLow))/(fromHigh-fromLow)));
};

// Returns x raised to y power
exports.pow = function(x,y) {
    return (Math.pow(x,y));
};

// Returns the aquare root of x
exports.sqrt = function(x) {
    return (Math.sqrt(x));
};

// Returns nothing
var randomSeedValue;
exports.randomSeed = function(x) {
    // empty - javascript has no random seed function
    randomSeedValue = x;
};

// Returns a pseudo-random number
// Valid calls: random(max)
//              random(min, max) 
exports.random = function(min, max) {
    if (isNaN(max))
    {
        max = min;
        min = 0;
    }
    return ((Math.random()*(max-min))+min);
};

