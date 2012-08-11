var http = require('http'), // HTTP server
    io = require('socket.io'), // Socket.io
    fs = require('fs'); // File System

server = http.createServer(function(req, res){
            res.writeHead(200, {'Content-Type': 'text/html'});
            var output = fs.readFileSync('./qwdclient.html', 'utf8');
            res.end(output);
        });

server.listen(8080);

var socket = io.listen(server);

var numPeople = 0;
socket.on('connection', function(client){
    numPeople = numPeople + 1;
    if (numPeople <= 2){
        client.broadcast({message: client.sessionId + ' is now available'});

        client.on('message', function(msg){ 
            client.broadcast({ 
                message: client.sessionId + ': ' + msg.message 
                });
        });

        client.on('pass', function(msg){
            client.broadcast({ 
                message: client.sessionId + ': Pass. ' + msg.message
                });
        });

        client.on('nopass', function(msg){
            client.broadcast({ 
                message: client.sessionId + ": Don't pass." + msg.message
                });
        });
        client.on('disconnect', function(){
            client.broadcast({ 
                message: client.sessionId + ' is no longer available'
                });
        });
    }
});
