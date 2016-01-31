var fs = require("fs");
var http = require('http');
var url = require('url');

//Create a server
var server = http.createServer(function(req, res) {
    require(__dirname + "/routes")(req, res);
});

fs.watch(__dirname + '/../res/sass', function(event, filename) {
    if (event == 'change') {
        if (filename.indexOf(".sass") == filename.length - 5) {
            console.log("Processing SASS File " + filename);
            require('node-sass').render({
                file: __dirname + '/../res/sass/' + filename,
                outFile: __dirname + '/../res/css/' + filename.replace('.sass', '.css'),
                outputStyle: 'compressed'
            }, function(err, res) {
                if (err) {
                    console.log("Error Compiling", err);
                }
                console.log("Processed SASS File " + filename + " in " + res.stats.duration);
                fs.writeFile(__dirname + '/../res/css/' + filename.replace('.sass', '.css'), res.css);
            });
        }
    }
});

process.on('uncaughtException', function(err) {
    console.log(err);
});

var PORT = process.env.PORT | 80;

server.listen(PORT, function() {
    console.log("Server listening with port " + PORT);
});