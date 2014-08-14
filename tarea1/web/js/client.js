var webSocket;
var serverLocation = "ws://" + window.location.host + "/tarea1/echo/";
var messages = document.getElementById("messages");

function openSocket() {
    // Ensures only one connection is open at a time
    if (webSocket !== undefined && webSocket.readyState !== WebSocket.CLOSED) {
        writeResponse("WebSocket is already opened.");
        return;
    }
    
    var playerName = $('#playerName').val();
    
    // Create a new instance of the websocket
    webSocket = new WebSocket(serverLocation + playerName);

    /**
     * Binds functions to the listeners for the websocket.
     */
    webSocket.onopen = function() {
        $("#playerNameLabel").html(playerName);
        $("#playButton").hide();
        $("#logOutButton").show();
    };

    webSocket.onmessage = function(event) {
        var message = JSON.parse(event.data);
        processMessage(message);
    };
    
    WebSocket.onerror = function(event){
        $("#playButton").show();
    };

    webSocket.onclose = function(event) {
        messages.innerHTML += "<br/>" + "Connection closed";
        $('.player').remove();
        $('#playerNameLabel').html("");
    };
}

function processMessage(message){
    if(message.action === "updatePlayers"){
        addOnlinePlayer(message.playerName);
    } else if (message.action === "populatePlayersList"){
        var activePlayers = message.activePlayers;
        for (var i=0; i<activePlayers.length; i++) {
            addOnlinePlayer(activePlayers[i]);
        }
    } else if (message.action === "updatePlayersList"){
        if (message.status){
            addOnlinePlayer(message.playerName);
        } else{
            removeOnLinePlayer(message.playerName);
        }
    }
}

function addOnlinePlayer(playerName) {
    var newOnlinePlayer = createOnlinePlayer(playerName);
    newOnlinePlayer.appendTo($('#playersList'));
}

function createOnlinePlayer(playerName) {
    var link = $(document.createElement('a'));
    link.html(playerName);
    link.attr({id : (playerName + '-player')});
    link.addClass("list-group-item player");
    link.dblclick(function(){
        alert("dblclick");
//        showConversation(userName);
    });
    return link;
}

function removeOnLinePlayer(playerName) {
    $('#' + playerName + '-player').remove();
}

/**
 * Sends the value of the text input to the server
 */
function sendText(){
    
    var message = {
        action: "sendChatMessage",
        data: document.getElementById("messageinput").value
    };
    
    var json = JSON.stringify(message);
    webSocket.send(json);
}

function closeSocket() {
    webSocket.close();
    $("#playButton").show();
    $("#logOutButton").hide();
}

function writeResponse(json){
    var response = JSON.parse(json);
    var output;

    // Determine the type of message recieved and handle accordingly
    switch (response.action){
        case "image":
            output = "<img src=\'" + response.data + "\'/>";
            break;
        case "updateChat":
            output = response.data;
            break;
    }

    messages.innerHTML += "<br/>" + output;
}
           