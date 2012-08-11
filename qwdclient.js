var socket = io.connect("http://localhost:8080");
var buffer = [];

socket.on('connection', function(client){
    client.json.send({buffer: buffer});
    client.broadcast.json.send({ announcement: client.id + ' connected' });
});

socket.on('connect_failed', function(){
    alert('The connection to the server failed.');
});

socket.on('message', function(message){
    buffer.push(message);
    if(buffer.length > 15){
        buffer.shift();    
    }
    appendMessage(message.message);
});

socket.on('disconnect', function(client){ 
    client.broadcast.json.send({ announcement: client.id + ' disconnected' });
});

function sendMessage(message){
    if(!message){
        var msg = $("input#message").val(); 
        $("input#message").val('');
    } else {
        var msg = message; 
    }
    if(msg.length > 0){
        socket.emit("message", {message:msg})
    }
}

function appendMessage(message){
    $('div#chat-box').append('<div class="msg">' + message + '</div>'); 
}

function askQuestion(message){
    if (!message){
        var msg = $("input#message").val();
        $("input#message").val("");
    } else {
        var msg = message;
    }
    if(msg.length > 0){
        socket.emit("question", {message : msg});
    }
}

function passTest(message){
    if (!message){
        var msg = $("input#message").val();
        $("input#message").val("");
    } else {
        var msg = message;
    }
    if(msg.length > 0){
        socket.emit("pass", {message : msg});
    }
}

function dontPassTest(message){
    if (!message){
        var msg = $("input#message").val();
        $("input#message").val("");
    } else {
        var msg = message;
    }
    if (msg.length > 0){
        socket.emit("nopass", {message : msg})
    }
}
