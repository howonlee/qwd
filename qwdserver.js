var http = require('http'), // HTTP server
    io = require('socket.io'), // Socket.io
    fs = require('fs'); // File System
url = require('url'),
    path = require('path');

function onRequest(req, res){
    request = url.parse(req.url, true);
    var action = request.pathname;
    console.log(action);
    var output = null;
    if (action == '/') {
        res.writeHead(200, {'Content-Type': 'text/html'});
        var output = fs.readFileSync('./qwdclient.html', 'utf8');
    } else if (path.extname(action) === '.js'){
        res.writeHead(200, {'Content-Type' : 'text/javascript'});
        var output = fs.readFileSync("." + action);
    } else if (path.extname(action) === '.css'){
        res.writeHead(200, {'Content-Type' : 'text/css'});
        var output = fs.readFileSync("." + action);
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
