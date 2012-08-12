var socket = io.connect("http://localhost:8080");
var buffer = [];
var snippets = [];//all the snippets
var passages = [];
var questions = [];
var answers = []
var tests = [];
var selection = [];
var currId = 0;
var codeMode = false; //code mode; changes a few things
var name = "";

$(document).ready(function(){
    while (!name){
        name = prompt("Hey, what's your name?", client.id);
    }
});

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

var dispMessage = function (message){
    if (message.snippet){
        var msg = message.snippet.text;
        buffer.push(msg);
        if (buffer.length > 15){
            buffer.shift();
        }
        var pos = snippets.push(message);
        if (message.snippet.type === "passage"){ passages.push(pos); }
        if (message.snippet.type === "question"){ questions.push(pos); }
        appendSnippet(message.snippet.made_by, message.snippet.type, msg);
    } else {
        appendSnippet("admin", "note", message.message);
    }
}

var dispAnswer = function(message){
    if (message.snippet && message.parentQuestion){
        var pos = snippets.push(message);
        answers.push(pos);
        $('#' + message.parentQuestion).parent().append(makeSnippet(message.snippet.made_by, message.snippet.type, message.snippet.text, currId));
        $('div#' + currId).click(toggleSelection);
        snippets[parseInt(message.parentQuestion)].answers.push(currId);
        currId = currId + 1;
    }
}

var updateMessage = function(message){
    for (var i = 0; i < message.selection.length; i++){
        ourSnippet = snippets[message.selection[i]];
        ourSnippet.snippet.text = message.snippetText;
        $('#' + message.selection[i]).parent().replaceWith(makeSnippet(name, ourSnippet.snippet.type, message.snippetText, message.selection[i]));
        $('div#' + currId).click(toggleSelection);
    }
}

var deleteMessage = function(message){
    snippets.splice(message.index, 1);
    $('#' + message.index).parent().remove();
    stripArray = function(array){
        var curr = $.inArray(message.index, array);
        if (curr !== -1) { array.splice(curr, 1); }
    }
    stripArray(passages);
    stripArray(questions);
    stripArray(answers);
    resetSelection();
}

socket.on('message', dispMessage);
socket.on('passage', dispMessage);
socket.on('question', dispMessage);
socket.on('answer', dispAnswer);
socket.on('update', updateMessage);
socket.on('delete', deleteMessage);

function resetSelection(){
    
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

function makeSnippet(user, mode, text, _id){
    var toReturn = '<div class="alert"><div id= "';
    toReturn = toReturn + _id;
    toReturn = toReturn + '">';
    toReturn = toReturn + user + ": " + mode + ": ";
    toReturn = toReturn + text;
    toReturn = toReturn + '</div>';
    toReturn = toReturn + '</div>';
    return toReturn;
}

function appendSnippet(user, mode, message){
    console.log(message);
    $('div#chat-box')
        .append(makeSnippet(user, mode, message, currId));
    $('div#' + currId).click(toggleSelection);
    currId = currId + 1;
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
        var tempSnippet = Snippet(client.id, msg, "passage", name, "default");
        passage = {
            snippet : tempSnippet
        };
        socket.emit("passage", passage);
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
        var tempSnippet = Snippet(client.id, msg, "question", name, "default");
        question = {
            snippet : tempSnippet,
            answers : []
        };
        socket.emit("question", question);
    }
}

function answerQuestion(message){
    if (!message){
        var msg = $("input#message").val();
        $("input#message").val("");
        if (selection.length === 1){
            var questionPos = selection[0];
            if (snippets[parseInt(questionPos)].snippet.type !== "question"){
                alert("Answer a question");
                return false;
            }
        } else {
            alert("Make exactly one selection");
            return false;
        }
    } else {
        var msg = message;
    }
    if(msg.length > 0){
        var tempSnippet = Snippet(client.id, msg, "answer", name, "default");
        answer = {
            snippet : tempSnippet,
            parentQuestion : questionPos
        };
        socket.emit("answer", answer);
    }
}

function updateSnippet(message){
    if (!message){
        var msgText = $("input#message").val();
        var updateSelection = selection;
    } else {
        var msgText = message.text;
        var updateSelection = message.selection;
    }
    if (msgText.length > 0){
        socket.emit("update", {
            snippetText : msgText,
            selection : updateSelection
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

