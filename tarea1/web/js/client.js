var webSocket;
var messages = document.getElementById("messages");

function openSocket() {
    // Ensures only one connection is open at a time
    if (webSocket !== undefined && webSocket.readyState !== WebSocket.CLOSED) {
        writeResponse("WebSocket is already opened.");
        return;
    }
    // Create a new instance of the websocket
    webSocket = new WebSocket("ws://localhost:8080/tarea1/echo");

    /**
     * Binds functions to the listeners for the websocket.
     */
    webSocket.onopen = function(event) {
        // For reasons I can't determine, onopen gets called twice
        // and the first time event.data is undefined.
        // Leave a comment if you know the answer.
        if (event.data === undefined)
            return;
        
        registerPlayer();
        $("#playButton").hide();
        writeResponse(event.data);
    };

    webSocket.onmessage = function(event) {
        writeResponse(event.data);
    };
    
    WebSocket.onerror = function(event){
        $("#playButton").show();
    };

    webSocket.onclose = function(event) {
        messages.innerHTML += "<br/>" + "Connection closed";
    };
}

function registerPlayer(){
    var playerNameInput = $("#playerName");
    
    var message = {
        action: "registerPlayer",
        data: playerNameInput.value
    };
    
    var json = JSON.stringify(message);
    webSocket.send(json);
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
           