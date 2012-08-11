var socket = new io.Socket('127.0.0.1', {port:8080, connectTimeout:3000});

var buffer = [];
socket.connect();

socket.on('connection', function(client){
        client.send({buffer: buffer});
        client.broadcast({ announcement: client.sessionId + ' connected' });
        });

socket.on('connect_failed', function(){
        alert('The connection to the server failed.');
        });

socket.on('message', function(message){
        buffer.push(message);
        if(buffer.length > 15)
        buffer.shift();     
        appendMessage(message.message);
        });

socket.on('disconnect', function(client){ 
        client.broadcast({ announcement: client.sessionId + ' disconnected' });
        });

function sendMessage(message){
    if(!message){
        var msg = $("input#message").val(); 
        $("input#message").val('');
    } else {
        var msg = message; 
    }
    if(msg.length > 0){
        if(socket.send({message:msg}))
            appendMessage('You: ' + msg);
    }
}

function appendMessage(message){
    $('div#chat-box').append('<div class="msg">' + message + '</div>'); 
}
