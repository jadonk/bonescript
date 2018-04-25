module.exports = {};
var beautify = require('../node_modules/js-beautify');
var fs = require('fs');
var path = require('path');

var config = JSON.parse(fs.readFileSync('./lint-config.json'));
var index = 0;

testDir("./");
testDir("./src/");
testDir("./test/");

function testDir(dir) {
    var files = fs.readdirSync(dir);
    files.forEach(function (file, index) {
        testFile(dir + file);
    });
}

function testFile(fileToTest) {
    var stat = fs.statSync(fileToTest);
    if (stat.isFile() && fileToTest.match(/js$/)) {
        //console.log("Adding lint test for " + fileToTest);
        index++;
        module.exports["testLint" + index] = function (test) {
            var inFile = "a";
            var outFile = "b";
            test.expect(2);
            test.doesNotThrow(function () {
                console.log("Running lint on " + fileToTest);
                inFile = fs.readFileSync(fileToTest, 'utf8');
                outFile = beautify.js(inFile, config);
                //fs.writeFileSync(fileToTest + ".lint", outFile);
            });
            test.equal(inFile, outFile);
            test.done();
        };
    }
}