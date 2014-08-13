package py.una.pol.progweb;
/**
 *
 * @author juan
 */
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;
import javax.json.Json;
import javax.json.JsonObject;
import javax.websocket.EncodeException;
 
import javax.websocket.OnClose;
import javax.websocket.OnMessage;
import javax.websocket.OnOpen;
import javax.websocket.Session;
import javax.websocket.server.PathParam;
import javax.websocket.server.ServerEndpoint;
 
/** 
 * @ServerEndpoint gives the relative name for the end point
 * This will be accessed via ws://localhost:8080/WebSocketTest/websocket
 * Where localhost is the address of the host
 */
@ServerEndpoint(value="/echo/{playerName}", encoders = {MessageEncoder.class}, decoders = {MessageDecoder.class}) 
public class Server {
    
    private static final Map<String, Player> players = new HashMap<String, Player>();
    
    /**
     * @OnOpen allows us to intercept the creation of a new session.
     * The session class allows us to send data to the user.
     * In the method onOpen, we'll let the user know that the handshake was 
     * successful.
     */
    @OnOpen
    public void onOpen(Session session, @PathParam("playerName") String playerName ){
        System.out.println(session.getId() + " has opened a connection");
        
        Player player = new Player(playerName, session);
        players.put(session.getId(), player);
        
//        Crear metodos JS que modifiquen que segun el JSON identifiquen que partes del html modificar
        
        Message message = new Message(Json.createObjectBuilder()
            .add("action", "updatePlayers")
            .add("playerName", player.getPlayerName())
            .add("sessionId", player.getSessionId())
            .build());
        sendMessageToAll(message);
        
//        try {
//            Message connectedMessage = new Message(Json.createObjectBuilder()
//            .add("action", "updateChat")
//            .add("data", "User has connected")
//            .build());
//            session.getBasicRemote().sendObject(connectedMessage);
//        } catch (IOException ex) {
//            ex.printStackTrace();
//        } catch (EncodeException ex) {
//            Logger.getLogger(Server.class.getName()).log(Level.SEVERE, null, ex);
//        }
    }
 
    /**
     * When a user sends a message to the server, this method will intercept the message
     * and allow us to react to it. For now the message is read as a String.
     */
    @OnMessage
    public void onMessage(Message message, Session session){
        JsonObject json = message.getJson();
        
        String action = json.getString("action");
//        TODO: falta implementar el switch segun el action
        
        System.out.println("Message from " + session.getId() + ": " + message);
        sendMessageToAll(message);
    }
 
    /**
     * The user closes the connection.
     * 
     * Note: you can't send messages to the client from this method
     */
    @OnClose
    public void onClose(Session session){
        players.remove(session);
        System.out.println("Session " +session.getId()+" has ended");
        Message message = new Message(Json.createObjectBuilder()
            .add("action", "updateChat")
            .add("data", "User has disconnected")
            .build());
        sendMessageToAll(message);
    }
    
    private void sendMessageToAll(Message message){
        for(Session s : players){
            try {
                s.getBasicRemote().sendObject(message);
            } catch (IOException ex) {
                Logger.getLogger(Server.class.getName()).log(Level.SEVERE, null, ex);
            } catch (EncodeException ex) {
                Logger.getLogger(Server.class.getName()).log(Level.SEVERE, null, ex);
            }
        }
    }
}