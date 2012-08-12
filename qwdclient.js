var socket = io.connect("http://localhost:8080");
var buffer = [];
var snippets = [];//all the snippets
var passages = [];
var questions = [];
var tests = [];
var selection = [];
var currId = 0;
var codeMode = false; //code mode; changes a few things

socket.on('connection', function(client){
    client.json.send({buffer: buffer});
    client.broadcast.json.send({ announcement: client.id + ' connected' });
});

socket.on('disconnect', function(client){ 
    client.broadcast.json.send({ announcement: client.id + ' disconnected' });
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

function exportAsJson(_selection){

}

function exportAsXML(_selection){

}

function exportAsBox(_selection){
    
}

var dispMessage = function (message){
    if (message.snippet){
        var msg = message.snippet.text;
        buffer.push(msg);
        if (buffer.length > 15){
            buffer.shift();
        }
        appendSnippet(message.snippet.made_by, message.snippet.type, msg);
    } else {
        appendSnippet("admin", "note", message.message);
    }
}

var updateMessage = function(message){
    ourSnippet = snippets[message.index];
    ourSnippet.snippet.text = message.snippetText;
    $('#' + message.index).parent().replaceWith(makeSnippet(client.id, ourSnippet.snippet.type, message.snippetText, message.index));
}

var deleteMessage = function(message){
    snippets.splice(message.index, 1);
    $('#' + message.index).parent().remove();
}

socket.on('message', dispMessage);

socket.on('passage', function(message){
    dispMessage(message);
});

socket.on('question', function(message){
    dispMessage(message);
});

socket.on('answer', function(message){
    dispMessage(message);
});

socket.on('update', function(message){
    updateMessage(message);
});

socket.on('delete', function(message){
    deleteMessage(message);
});

//resets display to selection after selection change
function normDisplay(){
    for (var i = 0; i < snippets.length; i++){
        $('div#' + our_id).attr("class", "alert");
    }
    for (var i = 0; i < selection.length; i++){
        $('div#' + our_id).toggleClass("alert-info");
    }
}

function setSelection(newSelection){
//newSelection should be an array. if it's not, then we just empty selection
    if (newSelection){
        selection = newSelection;
    } else {
        selection = []
    }
    normDisplay();
}

function toggleSelection(evt){
    var our_id = evt.target.id;
    var index = $.inArray(our_id, selection);
    if (index === -1){
        selection.push(our_id);
    } else {
        selection.splice(index, 1);
    }
    $('div#' + our_id).toggleClass("alert-info");
}

function toggleCodeMode(){
    if (!codeMode){
        //turn it on
    } else {
        //turn it off
    }
}

function appendSnippet(user, mode, message){
    console.log(message);
    $('div#chat-box')
        .append(makeSnippet(user, mode, message, currId));
    $('div#' + currId).click(toggleSelection);
    currId = currId + 1;
}

function makeSnippet(user, mode, text, _id){
    var toReturn = '<div class="alert"><div id= "';
    toReturn = toReturn + _id;
    toReturn = toReturn + '">';
    toReturn = toReturn + user + ": " + mode + ": ";
    toReturn = toReturn + text;
    toReturn = toReturn + '</div>';
    toReturn = toReturn + '<input type="hidden" id="' + _id + '" />'
    toReturn = toReturn + '<button type="submit" class="btn" name="update" id="updatebtn" onclick="updateSnippet();">Update</button>';  
    toReturn = toReturn + '</div>';
    return toReturn;
}
//feed it in a function
function runTest(test){
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
            snippet : tempSnippet
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
            answers : []        
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
        var tempSnippet = Snippet(client.id, msg, "answer", client.id, "default");
        socket.emit("answer", {
            snippet : tempSnippet,
            parentQuestion : null
        });
    }
}

function updateSnippet(message){
    if (!message){
        var msgText = $("input#message").val();
        if (selection.length === 1){
            var snippetPos = selection[0];
            $("input#message").val("");
        } else {
            alert("Make only one selection");
        }
    } else {
        var msgText = message.text;
        var snippetPos = message.snippetPos;
    }
    if (msgText.length > 0){
        socket.emit("update", {
            snippetText : msgText,
            index : snippetPos
        });
    }
}

function deleteSnippet(message){
    for (var i = 0; i < selection.length; i++){
        socket.emit("delete", {
            index : selection[i]
        });
    }
}

