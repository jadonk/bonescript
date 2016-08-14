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
        console.log("done");
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

                    fs.writeFile(myRunner.path + myRunner.folder + "/" + "inputFile", myRunner.stdin,function(err) {
                        console.log(myRunner.path + myRunner.folder + "/" + "inputFile");
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

}


module.exports = pythonRunner;