import { WebSocketServer, WebSocket } from "ws";
import Redis from "ioredis";
import { parse } from "url";
import { GameManager } from "./GameManger";

const redis = new Redis({
    port: 6380,
    host: "127.0.0.1",
});

export class SocketManager {
    private wss: WebSocketServer;
    private gameManager: GameManager;

    constructor(port:number) {
        this.wss = new WebSocketServer({ port: port });
        this.gameManager = new GameManager();

        this.wss.on("connection", this.handleConnection.bind(this));
    }

    handleConnection(ws: WebSocket, req: any) {
        const parameters = parse(req.url!, true).query;
        const token = parameters.token as string;

        redis.get(token, (err, session) => {
            if (err || !session) {
                ws.close();
                return;
            }

            const sessionData = JSON.parse(session);
            console.log("Session:", sessionData);
            if (sessionData.userId) {
                this.gameManager.setUser(sessionData, ws,token);
                ws.on("message", (data) => {
                    const message = JSON.parse(data.toString());
                    if(!message.type){
                        return;
                    }
                    if(message.type=='ping'){
                        return;
                    }
                    this.gameManager.handleMessage({ ...message, userId: sessionData.userId });
                });

                ws.on("close", () => {
                    console.log("ws closed : ",sessionData.userId);
                    this.gameManager.userLostConnection(sessionData.userId);
                });
            } else {
                ws.send(JSON.stringify({type:"UNAUTHORIZED",status:400}));
                ws.close();
            }
        });
    }
}
