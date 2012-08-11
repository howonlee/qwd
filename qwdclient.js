var socket = io.connect("http://localhost:8080");
var buffer = [];
var snippets = [];//all the snippets
var passages = [];
var questions = [];
var tests = [];

socket.on('connection', function(client){
    client.json.send({buffer: buffer});
    client.broadcast.json.send({ announcement: client.id + ' connected' });
});

socket.on('connect_failed', function(){
    alert('The connection to the server failed.');
});

var Snippet = function(id_, text_, type_, made_by_, parent_file_){
    var date_ = new Date();
    var snip = {
        id : id_,
        text : text_,
        type : type_,
        created : date_,
        modified : date_,
        made_by : made_by_,
        parent_file : parent_file_
    };
    return snip;
}

var dispMessage = function (message){
    if (message.snippet){
        var msg = message.snippet.text;
    } else {
        var msg = message.message;
    }
    buffer.push(msg);
    if (buffer.length > 15){
        buffer.shift();
    }
    appendMessage(msg);
}
socket.on('message', dispMessage);

socket.on('passage', function(message){
    dispMessage(message);
});

socket.on('pass', function(message){
    dispMessage(message);
});
socket.on('nopass', dispMessage);

socket.on('question', function(message){
    dispMessage(message);
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
        var tempSnippet = Snippet(0, msg, "passage", client.id, "default");
        socket.emit("passage", {
                snippet : tempSnippet,
                questions : [],
                tests : [],
                passed : false
            });
    }
}

function appendMessage(message){
    console.log(message);
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
