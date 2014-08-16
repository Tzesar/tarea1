var webSocket;
var serverLocation = "ws://" + window.location.host + "/tarea1/echo/";
var messages = document.getElementById("messages");

//    actionCodes
//    1 - Create new game
//    2 = New move


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
    } else if (message.action === "gameStarted"){
        createGameTab(message);
    } else if (message.action === "newMove"){
        var cell = $("#"+ message.gameId +"-"+message.indicator);
        cell.closest("div").attr("turn", "true");
        cell.html("O");
    } else if(message.action === "youLose"){
        var cell = $("#"+ message.gameId +"-"+message.indicator);
        
        cell.closest("div").attr("turn", "false");
        cell.html("O");
        
        bootbox.alert("Ha perdido la partida");
    } else if(message.action === "youWon"){
        var tab = $("#"+ message.gameId);
        tab.attr("turn", "false");
        
        bootbox.alert("Ha ganado la partida");
    } else if(message.action === "tiedBoring"){
        var cell = $("#"+ message.gameId +"-"+message.indicator);
        cell.closest("div").attr("turn", "false");
        cell.html("O");
        
        bootbox.alert("Has empatado la partida. Esto es un tanto decepcionante.");
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
    link.click(function(){
//        Enviar mensaje para iniciar el juego, el servidor devuelve el ID del nuevo juego
        var message = {
            action : "startNewGame",
            actionCode : "1",
            opponent : playerName
        };
        var json = JSON.stringify(message);
        webSocket.send(json);
    });
    return link;
}

function removeOnLinePlayer(playerName) {
    $('#' + playerName + '-player').remove();
}

function createGameTab(message) {
//    <li id="playerName-game-link" class="active"><a href="#playerName-game" role="tab" data-toggle="tab">PlayerName</a></li>
//    <div class="tab-pane active" id="playerName-game"></div>
    var gameId = message.gameId;
    var opponent = message.opponent;
    var turn = message.turn;
    var link = $(document.createElement('li'));
    var a = $(document.createElement('a'));
    var closeButton = $(document.createElement('button'));
    var tab = $(document.createElement('div'));

    closeButton.attr("type", "button");
    closeButton.attr("class", "close closeTab");
    closeButton.html('x');
    closeButton.appendTo(a);
    
    a.attr({href : "#" + gameId, role : "tab"});
    a.attr("data-toggle","tab");
    a.append(opponent);
    
    link.attr({id: gameId + "-game-link"});
    
    tab.attr({id: gameId});
    tab.attr("class", "tab-pane game");
    tab.attr({turn: turn});
    
    a.appendTo(link);
    link.appendTo($("#listOfGames"));
    
//        Si no existe ningun juego se marca al juego nuevo como activo
//    if (isEmpty($("#tabsOfGames"))){
//        link.attr("class", "active");
//        tab.attr("class", "active game");
//    }
    
    var ticTacToeBoard = createTicTacToeBoard(gameId);
    
    tab.append(ticTacToeBoard);
    
    tab.appendTo($("#tabsOfGames"));
    
    $("div .active").removeClass("active");
    $("li .active").removeClass("active");
    $(gameId+" a:last").tab("show");
    
    $('#'+ gameId +' a').click(function (e) {
        e.preventDefault();
        tab.tab('show');
    });
}

function isEmpty( el ){
    return !$.trim(el.html()).length;
}

function createTicTacToeBoard(gameId){
//    var container = $(document.createElement("div"));
//    var padLeft = $(document.createElement("div"));
//    var padRight = $(document.createElement("div"));
    var board = $(document.createElement("table"));
    var indicator = 1;
    var i;
    var j;
    var row;
    var cell;
    var parent;
    
//    padLeft.attr("class", "col-lg-4");
    board.attr("border", "1");
    board.attr("class", "table");
    for (i = 0; i < 3; i += 1) {
        row = $(document.createElement("tr"));
        board.append(row);
        for (j = 0; j < 3; j += 1) {
            addCell(indicator, row, gameId);
            indicator += indicator;
        }
    }
    
    return board;
}

function addCell(indicator, row, gameId){
    var newCell = createNewCell(indicator, gameId);
    newCell.appendTo(row);
}

function createNewCell(indicator, gameId){
    var cell = $(document.createElement("td"));
            
    cell.attr({height: "50", valign: "center"});
    cell.attr("id", gameId+"-"+indicator);
    cell.attr("indicator", indicator);
    cell.click( function(){
        set(gameId+"-"+indicator, gameId);
    });
    cell.append("");
    
    return cell;
}

function set(cellId, gameId){
    var turn = "X";
    var cell = $("#"+cellId);
    
    if(!isEmpty(cell)){
        //alert("notEmpty");
        return;
    }
    if( cell.closest("div").attr("turn") === "false"){
        bootbox.alert("No es tu turno");
        return;
    }
    cell.html(turn);
    var message = {
        action : "newMove",
        actionCode : "3",
        gameId: gameId,
        indicator : cell.attr("indicator")
    };
    var json = JSON.stringify(message);
    webSocket.send(json);
    
    cell.closest("div").attr("turn", "false");
    
//    moves += 1;
//    score[turn] += this.indicator;
//    if (win(score[turn])) {
//        alert(turn + " wins!");
//        startNewGame();
//    } else if (moves === 9) {
//        alert("Cat\u2019s game!");
//        startNewGame();
//    } else {
//    }
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
           