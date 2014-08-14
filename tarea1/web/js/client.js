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
        createGameTab(playerName);
    });
    return link;
}

function removeOnLinePlayer(playerName) {
    $('#' + playerName + '-player').remove();
}

function createGameTab(playerName) {
//    <li id="playerName-game-link" class="active"><a href="#playerName-game" role="tab" data-toggle="tab">PlayerName</a></li>
//    <div class="tab-pane active" id="playerName-game"></div>
    var link = $(document.createElement('li'));
    var a = $(document.createElement('a'));
    var tab = $(document.createElement('div'));
    
    a.attr({href : "#" + playerName + "-game", role : "tab"});
    a.attr("data-toggle","tab");
    a.html(playerName);
    
    link.attr({id: playerName + "-game-link"});
    
    tab.attr({id: playerName + "-game"});
    tab.attr("class", "tab-pane");
    
    a.appendTo(link);
    link.appendTo($("#listOfGames"));
    
    //    Si no existe ningun juego se marca al juego nuevo como activo
    if (isEmpty($("#tabsOfGames"))){
        link.attr("class", "active");
        tab.attr("class", "active");
    }
    
    tab.appendTo($("#tabsOfGames"));
    
    $('#'+ playerName +'-game a').click(function (e) {
        e.preventDefault();
        $(this).tab('show');
    });
}

function isEmpty( el ){
    return !$.trim(el.html()).length;
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
    $("#tabsOfGames").empty();
    $("#listOfGames").empty();
    $("#playersList").empty();
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
           