/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package py.una.pol.progweb;

import javax.websocket.Session;

/**
 *
 * @author augusto
 */
public class Player {
    
    private String playerName;
    private Session session;
    
    public Player (String playerName, Session session){
        this.playerName = playerName;
        this.session = session;
    }

    public String getPlayerName() {
        return this.playerName;
    }

    public void setPlayerName(String playerName) {
        this.playerName = playerName;
    }

    public Session getSession() {
        return this.session;
    }

    public void setSession(Session session) {
        this.session = session;
    }
    
    public String getSessionId(){
        return this.session.getId();
    }
}
