/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package py.una.pol.progweb;

import java.util.UUID;

/**
 *
 * @author augusto
 */
public class Game {
    private String playerName1;
    private String playerName2;
    private UUID gameId;
    
    public Game(String playerName1, String playerName2){
        this.playerName1 = playerName1;
        this.playerName2 = playerName2;
        this.gameId = UUID.randomUUID();
    }

    public String getPlayerName1() {
        return playerName1;
    }

    public void setPlayerName1(String playerName1) {
        this.playerName1 = playerName1;
    }

    public String getPlayerName2() {
        return playerName2;
    }

    public void setPlayerName2(String playerName2) {
        this.playerName2 = playerName2;
    }

    public UUID getGameId() {
        return gameId;
    }
}
