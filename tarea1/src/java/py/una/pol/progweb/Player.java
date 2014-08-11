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

    public String getPlayerName() {
        return playerName;
    }

    public void setPlayerName(String playerName) {
        this.playerName = playerName;
    }

    public Session getSession() {
        return session;
    }

    public void setSession(Session session) {
        this.session = session;
    }
}
