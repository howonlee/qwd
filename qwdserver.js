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
socket.sockets.on('connection', function(client){
    numPeople = numPeople + 1;
    if (numPeople <= 2){
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
            numPeople = numPeople - 1;
        });
    }
});
