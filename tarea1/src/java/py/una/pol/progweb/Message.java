/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package py.una.pol.progweb;

/**
 *
 * @author augusto
 */
import com.google.gson.Gson;
import com.google.gson.JsonObject;
import java.io.StringWriter;
//import javax.json.Json;
//import javax.json.JsonObject;
 
public class Message {
//    private JsonObject json;
    private JsonObject json;
 
    public Message(JsonObject json) {
        this.json = json;
    }
 
    public JsonObject getJson() {
        return json;
    }
 
    public void setJson(JsonObject json) {
        this.json = json;
    }
 
    @Override
    public String toString(){
//        StringWriter writer = new StringWriter();
 
//        Json.createWriter(writer).write(json);
        return this.json.toString();
 
//        return writer.toString();
    }
 
}