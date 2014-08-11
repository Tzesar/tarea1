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

        writeResponse(event.data);
    };

    webSocket.onmessage = function(event) {
        writeResponse(event.data);
    };
    
    WebSocket.onerror = function(event){
        console.log(event.data);
    };

    webSocket.onclose = function(event) {
        messages.innerHTML += "<br/>" + "Connection closed";
    };
}

function sendImage(){
    var file = document.getElementById("imageinput").files[0];

    var reader = new FileReader();
    // Builds a JSON object for the image and sends it
    var json;
    reader.onloadend = function(){
        json = JSON.stringify({
            "type":"image",
            "data":reader.result
        });
        
    };
    
    // Make sure the file exists and is an image
    if(file && file.type.match("image")){
        reader.readAsDataURL(file);
    }
    webSocket.send(json);
}

/**
 * Sends the value of the text input to the server
 */
function sendText(){
    var json = JSON.stringify({
        "type":"text",
        "data":document.getElementById("messageinput").value
    });
    webSocket.send(json);
}

function closeSocket() {
    webSocket.close();
}

function writeResponse(json){
    var response = JSON.parse(json);
    var output;

    // Determine the type of message recieved and handle accordingly
    switch (response.type){
        case "image":
            output = "<img src=\'" + response.data + "\'/>";
            break;
        case "text":
            output = response.data;
            break;
    }

    messages.innerHTML += "<br/>" + output;
}
           