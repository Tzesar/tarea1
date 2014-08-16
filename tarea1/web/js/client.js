var webSocket;
var serverLocation = "ws://" + window.location.host + "/tarea1/echo/";

//    actionCodes
//    1 - Create new game
//    2 - New move
//    3 - NewMove
//    4 - youLose
//    5 - youWon
//    6 - TiedBoring
//    7 - closeSession

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
        alert("Se ha perdido conexion con el servidor");
        
        $("#listOfGames").empty();
        $("#tabsOfGames").empty();
        
        $("#playButton").show();
        $("#logOutButton").hide();
        
        $('.player').remove();
        $('#playerNameLabel').empty();
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
    } else if(message.action === "playerWalkedOver"){
        var gameTab = $("#"+message.gameId);
        var gameLink = $("#"+message.gameId+"-game-link");
        var opponent = message.opponent;
        
        bootbox.alert("El usuario "+ opponent +" ha cerrado la partida.");
        gameTab.remove();
        gameLink.remove();
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
    closeButton.click( function(){
       closeTab(gameId);
    });
    
    a.attr({href : "#" + gameId, role : "tab"});
    a.attr("data-toggle","tab");
    a.append(opponent);
    
    link.attr({id: gameId + "-game-link"});
    
    tab.attr({id: gameId});
    tab.attr("class", "tab-pane game");
    tab.attr({turn: turn});
    
    a.appendTo(link);
    link.appendTo($("#listOfGames"));
    
    var ticTacToeBoard = createTicTacToeBoard(gameId);
    
    tab.append(ticTacToeBoard);
    
    tab.appendTo($("#tabsOfGames"));
    
    $("div .active").removeClass("active");
    $("li .active").removeClass("active");
    $("game a:last").tab("show");
    
    $('#'+ gameId +' a').click(function (e) {
        e.preventDefault();
        tab.tab('show');
    });
}

function isEmpty( el ){
    return !$.trim(el.html()).length;
}

function closeTab(gameId){
    var tab = $("#"+gameId);
    var link = $("#"+gameId+"-game-link");
    
    var message = {
        action : "gameFinished",
        actionCode : "9",
        gameId : gameId
    };
    var json = JSON.stringify(message);
    webSocket.send(json);
    
    tab.remove();
    link.remove();
}

function createTicTacToeBoard(gameId){
    var board = $(document.createElement("table"));
    var indicator = 1;
    var i;
    var j;
    var row;
    var cell;
    var parent;
    
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
}

function closeSocket() {
    var openedGamesIds = [];
    var openedGames = $(".game");
    
    openedGames.each( function(){
       openedGamesIds.push( $(this).attr("id") );
    });
    
    var message = {
        action : "closeSession",
        actionCode : "7",
        games : openedGamesIds
    };

    var json = JSON.stringify(message);
    webSocket.send(json);
    
    webSocket.close();
    $("#tabsOfGames").empty();
    $("#listOfGames").empty();
    $("#playersList").empty();
    $("#playButton").show();
    $("#logOutButton").hide();
}
           
