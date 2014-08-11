package py.una.pol.progweb;
/**
 *
 * @author juan
 */
import java.io.IOException;
import java.util.Collections;
import java.util.HashSet;
import java.util.Set;
import java.util.logging.Level;
import java.util.logging.Logger;
import javax.json.Json;
import javax.websocket.EncodeException;
 
import javax.websocket.OnClose;
import javax.websocket.OnMessage;
import javax.websocket.OnOpen;
import javax.websocket.Session;
import javax.websocket.server.ServerEndpoint;
 
/** 
 * @ServerEndpoint gives the relative name for the end point
 * This will be accessed via ws://localhost:8080/WebSocketTest/websocket
 * Where localhost is the address of the host
 */
@ServerEndpoint(value="/echo", encoders = {MessageEncoder.class}, decoders = {MessageDecoder.class}) 
public class Server {
    
    private static final Set<Session> sessions = Collections.synchronizedSet(new HashSet<Session>());
    
    /**
     * @OnOpen allows us to intercept the creation of a new session.
     * The session class allows us to send data to the user.
     * In the method onOpen, we'll let the user know that the handshake was 
     * successful.
     */
    @OnOpen
    public void onOpen(Session session){
        System.out.println(session.getId() + " has opened a connection");
        
//        Requerir un nombre de jugador al iniciar la sesion
//        Crear metodos JS que modifiquen que segun el JSON identifiquen que partes del html modificar
        
        Message message = new Message(Json.createObjectBuilder()
            .add("type", "text")
            .add("data", "User has connected")
            .build());
        sendMessageToAll(message);
        
        try {
            Message connectedMessage = new Message(Json.createObjectBuilder()
            .add("type", "text")
            .add("data", "User has connected")
            .build());
            session.getBasicRemote().sendObject(connectedMessage);
        } catch (IOException ex) {
            ex.printStackTrace();
        } catch (EncodeException ex) {
            Logger.getLogger(Server.class.getName()).log(Level.SEVERE, null, ex);
        }
        sessions.add(session);
    }
 
    /**
     * When a user sends a message to the server, this method will intercept the message
     * and allow us to react to it. For now the message is read as a String.
     */
    @OnMessage
    public void onMessage(Message message, Session session){
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
        sessions.remove(session);
        System.out.println("Session " +session.getId()+" has ended");
        Message message = new Message(Json.createObjectBuilder()
            .add("type", "text")
            .add("data", "User has disconnected")
            .build());
        sendMessageToAll(message);
    }
    
    private void sendMessageToAll(Message message){
        for(Session s : sessions){
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