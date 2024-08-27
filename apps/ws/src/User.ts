import { WebSocket } from "ws";

export class User {
    public username: string;
    public socket: WebSocket;
    public userId: string;
    public token:string;
    public currentGame:string|null;
    public score:number=400;

    constructor(socket: WebSocket, userId: string, username: string ,token:string) {
        this.socket = socket;
        this.userId = userId;
        this.username = username;
        this.token=token;
        this.currentGame=null;
    }
    setSocket(socket:WebSocket){
        console.log(`\x1b[41m \nSOCKET RESET\n \x1b[40m`);
        this.socket=socket;
    }
    sendMessage(message: any) {
        try {
            if (this.socket.readyState === WebSocket.OPEN) {
                this.socket.send(JSON.stringify(message));
            } else {
                console.error('WebSocket is not open. Ready state: ' + this.socket.readyState);
            }
        } catch (error) {
            console.error('Failed to send message:', error);
        }
    }
    setCurrentGame(gameId:string|null=null){
        this.currentGame=gameId;
    }
    close() {
        this.socket.close();
    }
}
