var socket = io.connect("http://localhost:8080");
var buffer = [];
var snippets = [];//all the snippets
var passages = [];
var questions = [];
var tests = [];
var selection = [];
var currId = 0;

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

function exportAsText(_selection){
    var phrases = [];
    if (_selection){
        for (var i = 0; i < snippets.length; i++){
            if (snippets[i].snippet.type == "passage"){
                phrases.push(snippets[i]);
            }
        }
    } else {
        for (var i = 0; i < snippets.length; i++){
            if (snippets[i].snippet.type == "passage" ||
                snippets[i].snippet.type == "question"){
                phrases.push(snippets[i]);
            }
        }
    }
    var toReturn = "";
    for (var i = 0; i < phrases.length; i++){
        toReturn = toReturn + phrases[i].snippet.text + "\n\n";
    }
    return toReturn;
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
    appendSnippet(msg);
}
socket.on('message', dispMessage);

socket.on('passage', function(message){
    dispMessage(message);
});

socket.on('question', function(message){
    dispMessage(message);
});

socket.on('disconnect', function(client){ 
    client.broadcast.json.send({ announcement: client.id + ' disconnected' });
});

function setSelection(newSelection){
//newSelection should be an array. if it's not, then we just empty selection
    if (newSelection){
        selection = newSelection;
    } else {
        selection = []
    }
}

function toggleSelection(evt){
    var our_id = evt.target.id;
    var index = $.inArray(our_id, selection);
    if (index === -1){
        selection.push(our_id);
    } else {
        selection.splice(index, 1);
    }
    $('#' + our_id).toggleClass("label label-info");
}

function appendSnippet(message){
    console.log(message);
    $('div#chat-box')
        .append('<pre class="prettyprint"><div class="msg" id = "' + currId + '">' + message + '</div></pre>');
    $('div#' + currId).click(toggleSelection);
    currId = currId + 1;
}

function makeTest(message){
    //don't do anything for now
}

function runTest(message){
    //don't do anything for now
}

function sendMessage(message){
    if(!message){
        var msg = $("input#message").val(); 
        $("input#message").val('');
    } else {
        var msg = message; 
    }
    if(msg.length > 0){
        var tempSnippet = Snippet(client.id, msg, "passage", client.id, "default");
        passage = {
            snippet : tempSnippet,
            questions : [],
            tests : [],
            passed : false
        }
        socket.emit("passage", passage);
        snippets.push(passage);
    }
}

function askQuestion(message){
    if (!message){
        var msg = $("input#message").val();
        $("input#message").val("");
    } else {
        var msg = message;
    }
    if(msg.length > 0){
        var tempSnippet = Snippet(client.id, msg, "question", client.id, "default");
        socket.emit("question", {
                snippet : tempSnippet,
                parent_passage : null
            });
    }
}

function answerQuestion(message){
    if (!message){
        var msg = $("input#message").val();
        $("input#message").val("");
    } else {
        var msg = message;
    }
    if(msg.length > 0){
        var tempSnippet = Snippet(client.id, msg, "question", client.id, "default");
        socket.emit("question", {
                snippet : tempSnippet,
                parent_passage : null
            });
    }
}
