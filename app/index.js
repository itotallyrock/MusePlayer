var fs = require("fs");
var http = require('http');
var url = require('url');
var mime = require('mime');

//Create a server
var server = http.createServer(function(req, res) {
    if (req.method == "GET") {
        if (req.url.indexOf("/res") == 0) {
            console.log("GET Request @ " + req.url);
            var file_path = decodeURI(req.url).substring(req.url.indexOf(/([A-z]{0,})(\/[A-z]{1,}\.[A-z]{2,})/), req.url.length);
            fs.readFile('.' + file_path, function(err, content) {
                if (err) {
                    fs.readFile('./views/error.html', function(err, content) {
                        if (err) {
                            res.writeHead(500);
                        } else {
                            res.writeHead(500, {
                                'Content-Type': 'text/html'
                            });
                            res.end(content, 'utf-8');
                        }
                    });
                } else {
                    res.writeHead(200, {
                        'Content-Type': mime.lookup(file_path)
                    });
                    res.end(content);
                }
            });
        } else if (req.url == "/favicon.ico") {
            res.writeHead(302, {
                'Location': 'res/img/favicon.png'
            });
            res.end();
        } else if (req.url.indexOf("/api/musiclist.json") > -1) {
            var start = Date.now();
            fs.readdir(__dirname + "\\..\\res\\music\\", function(err, files) {
                if (err) {
                    res.end("['error']");
                    console.log("Request Took: " + (Date.now() - start) + "ms");
                } else {
                    var r = [];
                    files.forEach(function(o, i) {
                        //Filter only .mp3 files
                        if (files[i].indexOf(".mp3") !== files[i].length - 4) {
                            files.splice(i, 1);
                        }
                        r.push({
                            name: o,
                        });
                    });
                    res.end(JSON.stringify(files));
                    console.log("Request Took: " + (Date.now() - start) + "ms");
                }
            });
        } else if (req.url == "/player") {
            var start = Date.now();
            console.log("GET Request @ " + req.url);
            fs.readFile('./views/index.html', function(err, content) {
                if (err) {
                    res.writeHead(500);
                    res.end();
                } else {
                    res.writeHead(200, {
                        'Content-Type': 'text/html'
                    });
                    res.end(content, 'utf-8');
                    console.log("Request Took: " + (Date.now() - start) + "ms");
                }
            });
        } else {
            console.log("GET Request @ " + req.url);
            // fs.readFile('./views/index.html', function(err, content) {
            //     if (err) {
            //         res.writeHead(500);
            //         res.end();
            //     } else {
            //         res.writeHead(200, {
            //             'Content-Type': 'text/html'
            //         });
            //         res.end(content, 'utf-8');
            //     }
            // });
            res.writeHead(404);
            res.end("404 Page Not Found");
        }
    }
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

var PORT = 80;

server.listen(PORT, function() {
    console.log("Server listening with port " + PORT);
});