
import {  Chess } from "chess.js";
import { EventEmitter } from 'events';
interface moves{
    from: string,
    to: string,
    timestamp: Date;
}
export class Game  extends EventEmitter  {
    public gameId: string;
    public player1: string; 
    public player2: string;
    private board: Chess;
    private moves:moves[];
    private status: "created"|"process"|"gameOver";
    private result: "process"|"stalemate"|"insufficient_material"|"checkmate"|"timeover"|"resign"|"hand_shake_draw"|"threefold_repetition";
    private winner: "black"|"white"|"draw"|null;
    private startTime: Date;
    private endTime:Date|null;
    private timer: NodeJS.Timeout | null;
    private gameTime:number;
    private player1Time: number;
    private player2Time: number;
    private currentPlayer: string;
    constructor(player1: string, player2: string, gameId: string, fen?: string,moves?:moves[],timeLimit:number=1){
        super();
        this.player1 = player1;
        this.player2 = player2;
        this.gameId = gameId;
        this.board = fen ? new Chess(fen) : new Chess();
        this.status = 'created';
        this.winner = null;
        this.startTime = new Date();
        this.endTime = null;
        this.result="process";
        this.timer=null;
        this.gameTime=timeLimit*60;
        this.player1Time = timeLimit * 60 * 1000;
        this.player2Time = timeLimit * 60 * 1000;
        this.moves=moves?[...moves]:[];
        this.currentPlayer = player1;

        console.log("\x1b[32mgame created with \x1b[37m");
        this.startTimer(player1);
    }
    getStartTime():Date{
        return this.startTime;
    }
    private startTimer(player: string) {
        this.stopTimer(); // Stop any existing timer

        const decrementTime = () => {
            if (player === this.player1) {
                console.log("player1 time left :",this.player1Time/1000);
                this.player1Time -= 1000;
                if (this.player1Time <= 0) {
                    this.player1Time = 0;
                    this.handleTimeExpiry(player);
                }
            } else {
                console.log("player2 time left :",this.player2Time/1000);
                this.player2Time -= 1000;
                if (this.player2Time <= 0) {
                    this.player2Time = 0;
                    this.handleTimeExpiry(player);
                }
            }
        };
        this.timer = setInterval(decrementTime, 1000);
    }

    private stopTimer() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    private handleTimeExpiry(player: string) {
        this.stopTimer();
        const winner = player === this.player1 ? this.player2 : this.player1;
        this.setWinner(winner);

        // Emit a time expiry event
        this.emit('timeExpired', { gameId: this.gameId, player });
    }
    public destroy() {
        console.log(`\x1b[31mDestroying game: ${this.gameId}\x1b[37m`);
        this.stopTimer(); // Stop the game timer
        this.removeAllListeners(); // Remove all event listeners

        // Any other cleanup tasks
        this.board = null as any;
        this.moves = [];
        this.status = 'gameOver';
        this.result = 'process';
        this.winner = null;
        this.endTime = new Date();

        console.log(`\x1b[31mGame: ${this.gameId} destroyed.\x1b[37m`);
    }
    getGameBoard():string{
        return this.board.fen();
    }
    getGame():Chess{
        return this.board;
    }
    setResult(res:"process"|"stalemate"|"insufficient_material"|"checkmate"|"timeover"|"resign"|"hand_shake_draw"|"threefold_repetition"="process"){
        this.result=res;
    }
    Turn():string{
        return this.board.turn();
    }
    getMoves():moves[]{
        return [...this.moves];
    }
    playerColor(userId:string){
        if(userId==this.player1){
            return 'white';

        }
        else if(userId==this.player2){
            return 'black';
        }
        return;
    }
    setCheckmate(){
        this.result='checkmate';
        this.status='gameOver';
    }
    getResult(){
        return this.result;
    }

    handshakeDraw(){
        this.result="hand_shake_draw";
        this.winner='draw';
        this.endTime=new Date();
    }

    isWon(){
        return this.winner;
    }

    resignGame(resigner: string){
        if(this.player1===resigner){
            this.winner="black";
            this.status='gameOver';
            this.endTime=new Date();
            return "black";
        }
        if(this.player2===resigner){
            this.winner="white";
            this.status='gameOver';
            this.endTime=new Date();
            return "white";
        }
        return null;
    }

    getStatus(){
        return this.status;
    }
    
    setWinner(userId:string|null){
        if(this.player1==userId){
            this.winner='white';
            this.status='gameOver';
            return 'white';
        }
        else if(this.player2==userId){
            this.winner="black";
            this.status='gameOver';
            return 'black';
        }
        else{
            this.winner='draw';
            this.status='gameOver';
            return 'draw';
        }
    }

    makeMove(userId: string, move: { from: string; to: string }): boolean {
        if ((this.board.turn() === 'w' && this.player1 !== userId) || (this.board.turn() === 'b' && this.player2 !== userId)) {
            return false;
        }
        try {
            this.board.move({ from: move.from, to: move.to });
            const timestamp = new Date();
            this.moves.push({ ...move, timestamp });
            console.log("all the moves :", this.moves);
        } catch (e) {
            console.error(e);
            return false;
        }
        
        console.log('\x1b[35m move made in game.ts\x1b[37m');

        // Switch the timer to the other player
        this.currentPlayer = userId === this.player1 ? this.player2 : this.player1;
        this.startTimer(this.currentPlayer);

        return true;
    }

    
}
