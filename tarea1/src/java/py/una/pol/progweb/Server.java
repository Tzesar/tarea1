package py.una.pol.progweb;
/**
 *
 * @author juan
 */
import com.google.gson.Gson;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.reflect.TypeToken;
import java.io.IOException;
import java.lang.reflect.Type;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
//import java.util.logging.Level;
//import java.util.logging.Logger;
//import javax.json.Json;
//import javax.json.JsonArray;
//import javax.json.JsonArrayBuilder;
//import javax.json.JsonObject;
//import javax.json.JsonObjectBuilder;
import javax.websocket.EncodeException;
 
import javax.websocket.OnClose;
import javax.websocket.OnMessage;
import javax.websocket.OnOpen;
import javax.websocket.Session;
import javax.websocket.server.PathParam;
import javax.websocket.server.ServerEndpoint;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
 
/** 
 * @ServerEndpoint gives the relative name for the end point
 * This will be accessed via ws://localhost:8080/WebSocketTest/websocket
 * Where localhost is the address of the host
 */
@ServerEndpoint(value="/echo/{playerName}", encoders = {MessageEncoder.class}, decoders = {MessageDecoder.class}) 
public class Server {
    
    private static final Map<String, Player> playersBySession = Collections.synchronizedMap(new HashMap<String, Player>(10, (float)0.90));
    private static final Map<String, Player> playersByName = Collections.synchronizedMap(new HashMap<String, Player>(10, (float)0.90));
    private static final Logger log = LoggerFactory.getLogger(Server.class);
    
    /**
     * @OnOpen allows us to intercept the creation of a new session.
     * The session class allows us to send data to the user.
     * In the method onOpen, we'll let the user know that the handshake was 
     * successful.
     */
    @OnOpen
    public void onOpen(Session session, @PathParam("playerName") String playerName ){
        
        log.info(session.getId() + " has opened a connection");
        populatePlayersList(session);
        Player player = new Player(playerName, session);
        log.info("Player " + player.getPlayerName() + " created");
        playersBySession.put(session.getId(), player);
        playersByName.put(player.getPlayerName(), player);
        log.info("Player added to map");
        log.info("Session started");
        
        updatePlayersLists(player, true);
    }
 
    /**
     * When a user sends a message to the server, this method will intercept the message
     * and allow us to react to it. For now the message is read as a String.
     */
    @OnMessage
    public void onMessage(Message message, Session session){
        JsonObject json = message.getJson();
        Integer actionCode = Integer.parseInt(json.get("actionCode").toString());
        
//        String action = json.getString("action");
//        TODO: falta implementar el switch segun el action
        switch(actionCode){
            case 1:
                
                break;
        }
        Player player = playersBySession.get(session.getId());
        log.info("Message from " + player.getPlayerName() + ": " + message);
//        sendMessageToAll(message);
    }
    
    @OnClose
    public void onClose(Session session){
        Player player = playersBySession.get(session.getId());
        updatePlayersLists(player, false);
        playersBySession.remove(session.getId());
        log.info("Session " + session.getId() + " has ended");
        log.info("Player " + player.getPlayerName() + " removed from list");
    }
    
    private void sendMessageToAll(Message message){
        /*
         * Metodo que envia un mensaje a todos los jugadores.
         */
        for(Player player : playersBySession.values()){
            try {
                player.getSession().getBasicRemote().sendObject(message);
            } catch (IOException ex) {
                log.error(""+ex);
            } catch (EncodeException ex) {
                log.error(""+ex);
            }
        }
    }

    private void populatePlayersList(Session session) {
        /*
         * Metodo que envia un mensaje a un nuevo jugador. El mensaje contiene
         * una lista de todos los jugadores conectados.
         */
        List<String> activePlayers = getActivePlayers();
        Type jsonObjectType = new TypeToken<List<String>>() {}.getType();
        Gson gson = new Gson();
        
        JsonObject jsonMessage = new JsonObject();
        jsonMessage.addProperty("action", "populatePlayersList");
        jsonMessage.add("activePlayers", gson.toJsonTree(activePlayers, jsonObjectType) );
        
        Message connectedMessage = new Message(jsonMessage);
        
        try {
            session.getBasicRemote().sendObject(connectedMessage);
        } catch (IOException ex) {
            log.error(""+ex);
        } catch (EncodeException ex) {
            log.error(""+ex);
        }
    }

    private List<String> getActivePlayers() {
        final List<String> activeUsers = new ArrayList<String>();
        for (Player player : playersBySession.values()) {
            activeUsers.add(player.getPlayerName());
        }
        return activeUsers;
    }

    private void updatePlayersLists(Player player, boolean b) {
        /*
         * Metodo que envia un mensaje a todos los demas jugadores cuando existe 
         * una modificacion en el estado de la conexion de un jugador.
         * El atributo booleano status del mensaje indica si el jugador se conecta o se desconecta.
         */
        
        JsonObject jsonMessage = new JsonObject();
        
        jsonMessage.addProperty("action", "updatePlayersList");
        jsonMessage.addProperty("status", b);
        jsonMessage.addProperty("playerName", player.getPlayerName());
        
        Message updateMessage = new Message(jsonMessage);
        
        Set<Session> otherConnectedPlayers = getOtherConnectedPlayers(player);
        
        for (Session s : otherConnectedPlayers){
            try {
                s.getBasicRemote().sendObject(updateMessage);
            } catch (IOException ex) {
                log.error(""+ex);
            } catch (EncodeException ex) {
                log.error(""+ex);
            }
        }
    }

    private Set<Session> getOtherConnectedPlayers(Player player) {
        Set<Session> allConnections = player.getSession().getOpenSessions();
        allConnections.remove(player.getSession());
        return allConnections;
    }
}