var http = require('http'), // HTTP server
    io = require('socket.io'), // Socket.io
    fs = require('fs'); // File System

server = http.createServer(function(req, res){
            res.writeHead(200, {'Content-Type': 'text/html'});
            var output = fs.readFileSync('./index.html', 'utf8');
            res.end(output);
        });

server.listen(8080);

var socket = io.listen(server);

socket.on('connection', function(client){
    client.broadcast({message: client.sessionId + ' is now available'});
    
    client.on('message', function(msg){ 
        client.broadcast({ message: client.sessionId + ': ' + msg.message });
    });
    client.on('disconnect', function(){
        client.broadcast({ message: client.sessionId + ' is no longer available'});
    });
});
