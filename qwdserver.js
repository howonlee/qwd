var http = require('http'), // HTTP server
    io = require('socket.io'), // Socket.io
    fs = require('fs'); // File System
    url = require('url'),
    path = require('path'),
    nstatic = require('node-static');

function start(){
    var file = new(nstatic.Server)('./public');
    function onRequest(req, res){
        req.addListener('end', function() {
            file.serve(req, res);
        });
        var pathname = url.parse(req.url).pathname;
        var output = null;
        if (pathname == '/') {
            res.writeHead(200, {'Content-Type': 'text/html'});
            var output = fs.readFileSync('./qwdclient.html', 'utf8');
        } else if (path.extname(pathname) === '.js'){
            res.writeHead(200, {'Content-Type' : 'text/javascript'});
            var output = fs.readFile(path.basename(pathname));
        }
        res.end(output);
    }
    server = http.createServer(onRequest).listen(8080);

    var socket = io.listen(server);

    socket.sockets.on('connection', function(client){
        client.broadcast.json.send({message: client.id + ' is now available'});
        client.on('question', function(msg){
            socket.sockets.emit("question", msg);
        });

        client.on('answer', function(msg){
            socket.sockets.emit("answer", msg);
        });

        client.on('passage', function(msg){ 
            socket.sockets.emit("passage", msg);
        });

        client.on('update', function(msg){
            socket.sockets.emit("update", msg);
        });

        client.on('delete', function(msg){
            socket.sockets.emit("delete", msg);
        });

        client.on('disconnect', function(){
            socket.sockets.json.send({ 
                message: client.id + ' is no longer available'
            });
        });
    });
}

exports.start = start;
