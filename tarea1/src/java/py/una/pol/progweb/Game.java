/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package py.una.pol.progweb;

import java.util.Random;
import java.util.UUID;

/**
 *
 * @author augusto
 */
public class Game {
    private String playerName1;
    private String playerName2;
    private int scoreP1;
    private int scoreP2;
    private UUID gameId;
    private int turn;
    private int moves;

    public int getTurn() {
        return turn;
    }
    
    public Game(String playerName1, String playerName2){
        this.playerName1 = playerName1;
        this.playerName2 = playerName2;
        this.scoreP1 = 0;
        this.scoreP2 = 0;
        this.gameId = UUID.randomUUID();
        this.turn = stablishTurn() + 1;
        this.moves = 0;
    }

    public void setTurn(int turn) {
        this.turn = turn;
    }

    public int getMoves() {
        return moves;
    }

    public void setMoves(int moves) {
        this.moves = moves;
    }

    public int getScoreP1() {
        return scoreP1;
    }

    public void setScoreP1(int scoreP1) {
        this.scoreP1 = scoreP1;
    }

    public int getScoreP2() {
        return scoreP2;
    }

    public void setScoreP2(int scoreP2) {
        this.scoreP2 = scoreP2;
    }
    
    private int stablishTurn(){
        Random randomGenerator = new Random();
        int turn = randomGenerator.nextInt(1);
        return turn;
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
    
    public int checkWin(){
        
        int[] wins = {7, 56, 448, 73, 146, 292, 273, 84};
        
        for ( int score : wins){
            if (this.scoreP1 == score){
                return 1;
            }
            if (this.scoreP2 == score){
                return 1;
            }
        }
        if (moves >= 9){
            return 2;
        }
        return 0;
    }
}
