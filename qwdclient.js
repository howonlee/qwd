var socket = io.connect("http://localhost:8080");
var buffer = [];
var snippets = [];//all the snippets
var snippetText = [];
var passages = [];
var questions = [];
var answers = []
var selection = [];
var currId = 0;
var name = "";

$(document).ready(function(){
    name = prompt("Name: ", "somebody");
});

socket.on('connection', function(client){
    name = prompt("Hey, what's your name?", client.id);
    client.json.send({buffer: buffer});
});

socket.on('disconnect', function(client){ 
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
    $('div#chat-box')
        .append(makeSnippet("admin", "note", message.message, -1));
    //all admin messages have -1
}

var dispSnippet = function (message){
    if (message.snippet){
        var msg = message.snippet.text;
        var type = message.snippet.type;
        buffer.push(msg);
        if (buffer.length > 15){
            buffer.shift();
        }
        var pos = snippets.push(message);
        if (type === "passage"){ passages.push(pos); }
        if (type === "question"){ questions.push(pos); }
        appendSnippet(message.snippet.made_by, type, msg);
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
        console.log("Currently updating snippet by: " + ourSnippet.snippet.made_by);
        console.log("That snippet has text: " + ourSnippet.snippet.text);
        console.log("Message from: " + message.snippet.made_by);
        console.log("Message has snippet text: " + message.snippet.text);
        ourSnippet.snippet.text = message.snippet.text;
        $('#' + message.selection[i]).parent().replaceWith(makeSnippet(message.snippet.made_by, message.snippet.type, message.snippet.text, message.selection[i]));
        $('div#' + message.selection[i]).click(toggleSelection);
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
socket.on('passage', dispSnippet);
socket.on('question', dispSnippet);
socket.on('answer', dispAnswer);
socket.on('update', updateMessage);
socket.on('delete', deleteMessage);

function getSnippets(){
    for (var i = 0; i < selection.length; i++){
        var currPlace = parseInt(selection[i]);
        var currSnippet = snippets[currPlace];
        if (currSnippet.snippet){
        if (currSnippet.snippet.type === "passage"){
            snippetText.push(currSnippet.snippet.text);
        } else if (currSnippet.snippet.type === "question"){
            snippetText.push(currSnippet.snippet.text);
        } else if (currSnippet.snippet.type === "answer"){
            snippetText.push(currSnippet.snippet.text); //need to match later
        } else if (currSnippet.snippet.type === "update"){
            snippetText.push(currSnippet.snippet.text);
        }
        }
    }
    return snippetText.join("\n\n");
}

function getAllSnippets(){
    resetSelection();
    $(".snippet").each(function(index, elem){
        selection.push(parseInt(this.id));
    });
    var txt = getSnippets();
    selection = [];
    return txt;
}

function getCli(){
    var text = getAllSnippets();
    var numLetters = text.replace(/\s+/g, "" ).length;
    var numWords = text.match(/\S+/g).length;
    var numSentences = text.match(/([.!?])\s+/g).length;
    var multiplier = 100 / numWords;
    var cli = ((numLetters * multiplier * 0.0588) - (numSentences * multiplier * 0.296) - 15.8);
    alert("The Coleman-Liau Index is " + cli + ". That is, that's the US grade level that this writing is at (so a first-year undergrad is 13, for example). Try to get a large sample.");
}

function resetSelection(){
    for (var i = 0; i < currId; i++){
        $('div#' + i).parent().removeClass("alert-info");
    }
    selection = [];
}

function selectAll(){
    $(".snippet").each(function(index, elem){
        selection.push(parseInt(this.id));
    });
    for (var i = 0; i < selection.length; i++){
    $('div#' + selection[i]).parent().addClass("alert-info");
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
    $('div#' + our_id).parent().toggleClass("alert-info");
}

function save(contents){
    var title = prompt("What do you want to name this file?", "whoopsydaisy.txt");
    message = { name : title, content : contents };
    socket.emit("save", message);
}

function makeSnippet(user, mode, text, _id){
    var toReturn = '<div class="alert"><div class="snippet" id= "';
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
        var tempSnippet = Snippet(client.id, msgText, "update", name, "default");
        socket.emit("update", {
            snippet : tempSnippet,
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

