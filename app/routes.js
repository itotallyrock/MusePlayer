var fs = require("fs");
var mime = require('mime');

module.exports = function(req, res) {
    if (req.method == "GET") {
        if (req.url.indexOf("/res") == 0) {
            console.log("GET Request @ " + req.url);
            var file_path = decodeURI(req.url).substring(req.url.indexOf(/([A-z]{0,})(\/[A-z]{1,}\.[A-z]{2,})/), req.url.length);
            fs.readFile('.' + file_path, function(err, content) {
                if (err) {
                    res.writeHead(404);
                    res.end();
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
        } else if (req.url == "/") {
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
}