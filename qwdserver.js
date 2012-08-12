var http = require('http'), // HTTP server
    io = require('socket.io'), // Socket.io
    fs = require('fs'); // File System
function start(){
    function onRequest(req, res){
        var pathname = url.parse(request.url).pathname;
        res.writeHead(200, {'Content-Type': 'text/html'});
        var output = fs.readFileSync('./qwdclient.html', 'utf8');
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
