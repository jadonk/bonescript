var pythonRunner = function(path, folder, fileName, code, stdin)
{
    this.path=path;
    this.folder=folder;
    this.fileName=fileName;
    this.code = code;
    this.stdin=stdin;
}

pythonRunner.prototype.run = function(callback) 
{
    var myRunner = this;

    myRunner.writeFiles( function(){
        myRunner.executeScript(callback);
    });
}

pythonRunner.prototype.writeFiles = function(callback)
{
    var myRunner = this;

    var exec = require('child_process').exec;
    var fs = require('fs');

    console.log("mkdir "+ myRunner.path + myRunner.folder);
    exec("mkdir "+ myRunner.path + myRunner.folder + "&& chmod 777 "+ myRunner.path + myRunner.folder, function(st)
        {
            fs.writeFile(myRunner.path + myRunner.folder + "/" + myRunner.fileName, myRunner.code,function(err) {
                console.log(myRunner.path + myRunner.folder + "/" + myRunner.fileName);
                if (err) {
                    console.log(err);
                } 
                else {
                    console.log("Python file saved!");

                    fs.writeFile(myRunner.path + myRunner.folder + "/inputFile", myRunner.stdin,function(err) {
                        console.log(myRunner.path + myRunner.folder + "/inputFile");
                        if (err) {
                            console.log(err);
                        }    
                        else {
                            console.log("Input file saved!");
                            callback();
                        } 
                    });    
                } 
            });
 
        });
}

pythonRunner.prototype.executeScript = function(callback)
{
    var myRunner = this;

    var exec = require('child_process').exec;
    var fs = require('fs');

    //execute ppython script -> write stdout or stderr to output.text
    //return output.text contents in callback
    c = exec("python " + myRunner.path + myRunner.folder + "/" + myRunner.fileName + " -< " + myRunner.path + myRunner.folder + "/inputFile " + "2>&1 | tee -a " + myRunner.path + myRunner.folder + "/output.text", function(st){
        fs.readFile(myRunner.path + myRunner.folder + '/output.text', 'utf8', function(err, data){
                    if (!data) {
                        console.log= "error reading output file";
                    }
                    else {
                        callback(data);
                    }
        });
    });

    console.log(c.pid);
}

pythonRunner.prototype.killScript = function(callback)
{
    var myRunner = this;
    var exec = require('child_process').exec;

    //remove temporary folder and kill python process
    exec("rm -rf "+ myRunner.path + myRunner.folder, function(st){
            c.kill();
            callback("process terminated");
    });
}

module.exports = pythonRunner;