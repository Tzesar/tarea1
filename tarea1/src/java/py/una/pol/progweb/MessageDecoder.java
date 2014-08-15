package py.una.pol.progweb;

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.google.gson.reflect.TypeToken;
import java.io.StringReader;
import java.lang.reflect.Type;
import javax.json.Json;
import javax.json.JsonException;
//import javax.json.Json;
//import javax.json.JsonException;
//import javax.json.JsonObject;
import javax.websocket.DecodeException;
import javax.websocket.Decoder;
import javax.websocket.EndpointConfig;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 *
 * @author augusto
 * Decodes a client-sent string into a Message class
 */
public class MessageDecoder implements Decoder.Text<Message>{
    private static final Logger log = LoggerFactory.getLogger(Server.class);
    
    /**
     * Transform the input string into a Message
     */
    @Override
    public Message decode(String string) throws DecodeException {
//        JsonObject json = Json.createReader(new StringReader(string)).readObject();
        Gson gson = new Gson();
        Type jsonObjectType = new TypeToken<JsonObject>() {}.getType();
        JsonObject json = gson.fromJson(string, jsonObjectType);
        return new Message(json);
    }
 
    /**
     * Checks whether the input can be turned into a valid Message object
     * in this case, if we can read it as a Json object, we can.
     */
    @Override
    public boolean willDecode(String string) {
        try{
            Gson gson = new Gson();
            Type jsonObjectType = new TypeToken<JsonObject>() {}.getType();
            JsonObject json = gson.fromJson(string, jsonObjectType);
            return true;
        }catch (JsonException ex){
            log.error(ex.toString());
            return false;
        }
    }
 
    /**
     * The following two methods are placeholders as we don't need to do anything
     * special for init or destroy.
     */
    @Override
    public void init(EndpointConfig config) {
        log.info("init");
    }
    @Override
    public void destroy() {
        log.info("destroy");
    }
 
}
