import { User } from "./User";
import { INIT_GAME, MOVE, RESIGN_GAME, GAME_OVER, SENDMOVE, GAME_RECONNCETED, MESSAGE_RELAY } from "./messages";
import { Game } from "./Game";
import Redis from "ioredis";
import { WebSocket } from "ws";
import { ConnectionStates } from "mongoose";


// always assume that game is in blackPlayer|player2's first server
// any message by white player will be transmitted to blackplayer's server via pub sub
// when reconnection happens black player will make a new game instance and white player will only get a cache of game object

const pub = new Redis({
    port: 6379,
    host: "127.0.0.1",
});
const sub = new Redis({
    port: 6379,
    host: "127.0.0.1",
});
const redis = new Redis(
    {
        port: 6380,
        host: "127.0.0.1",
    }
);

interface SessionData {
    username: string;
    userId: string;
}

export class GameManager {
    private games: Map<string, Game>;
    private pendingUser: string | null;
    private users: Map<string, User>;
    private disconnectTimeouts: Map<string, NodeJS.Timeout>;
    private static isSubscribed: boolean = false;
    constructor() {
        this.games = new Map();
        this.pendingUser = null;
        this.users = new Map();
        this.disconnectTimeouts = new Map();

        if (!GameManager.isSubscribed) {
            sub.subscribe("game_channel", (err, count) => {
                if (err) {
                    console.error("Failed to subscribe: %s", err.message);
                } else {
                    console.log(`Subscribed successfully! This client is currently subscribed to ${count} channels.`);
                }
            });

            sub.on("message", (channel, message) => {
                console.log(`Message received from channel ${channel}: ${message}`);
                const parsedMessage = JSON.parse(message);
                this.handelPubSub(parsedMessage);
            });
            GameManager.isSubscribed = true;
        }
    }

    // #region subscriber codes !!!!!!!!
    handelPubSub(message: any) {
        const { type } = message;
        console.log(' \x1b[41m INSDE PUB-SUB \x1b[40m');

        switch (type) {
            case GAME_OVER:
                //{ type: GAME_OVER, sendUser: p2, gameId: gameId, message: message }
                if (!(message.gameId && message.sendUser)) {
                    console.log({ message });
                    console.log("\x1b[41m message does not contain gameId \x1b[40m");
                    return;
                }
                if (this.games.has(message.gameId)) {
                    const game = this.games.get(message.gameId);
                    if (game) {
                        this.users.get(game.player1)?.sendMessage({
                            type: GAME_OVER,
                            payload: { winner: game.isWon() }
                        })
                        this.users.get(game.player2)?.sendMessage({
                            type: GAME_OVER,
                            payload: { winner: game.isWon() }
                        })
                        this.games.get(message.gameId).destroy();
                        this.games.delete(message.gameId);
                        redis.del(`gameId:${message.gameId}`);
                        console.log(`GAME DELETED`);
                    }
                }
                if (this.users.has(message.sendUser)) {
                    let user = this.users.get(message.sendUser);
                    user?.sendMessage({ type: GAME_OVER, payload: message.payload });
                }
                break;
            case MESSAGE_RELAY:
                if (message.sendUser) {
                    console.log(message);
                    if (this.users.has(message.sendUser)) {
                        console.log('\x1b[44m user is in this server message sent\x1b[40m');
                        this.users.get(message.sendUser)?.sendMessage({ ...message.payload });
                    } else {
                        console.log('\x1b[41m relay message user is not here\x1b[40m')
                    }
                }
                break;
            case SENDMOVE:
                //{ type: SENDMOVE, moveBy: game.player1|2, gameId: gameId, payload: move }]
                if (message.gameId) {
                    if (this.games.has(message.gameId)) {
                        const game = this.games.get(message.gameId);
                        if (game) {
                            if (game.getGame().isGameOver()) {
                                console.log("game was already over");
                            }
                            game.makeMove(message.moveBy, message.payload);
                            console.log("store in redis :", { fen: game.getGameBoard(), status: game.getStatus(), moves: game.getMoves(), player1: game.player1, player2: game.player2, gameId: message.gameId });
                            redis.set(`gameId:${game.gameId}`, JSON.stringify({
                                fen: game.getGameBoard(),
                                status: game.getStatus(),
                                moves: game.getMoves(),
                                player1: game.player1,
                                player2: game.player2,
                                gameId: message.gameId,
                                startTime: game.getStartTime()
                            }));
                            let sendUser = game.player1 == message.moveBy ? game.player2 : game.player1;
                            if (this.users.has(sendUser)) {
                                console.log("\x1b[33m sendMove users is also in it \x1b[37m");
                                this.users.get(sendUser)?.sendMessage(
                                    {
                                        type: MOVE,
                                        payload: message.payload,
                                        moves: game.getMoves()
                                    });
                            } else {
                                pub.publish("game_channel", JSON.stringify({
                                    type: MESSAGE_RELAY,
                                    sendUser: game?.player1,
                                    payload: {
                                        type: MOVE,
                                        payload: message.payload,
                                        moves: game.getMoves()
                                    }
                                }));
                            }
                            if (game.getGame().isGameOver()) {
                                console.log("\x1b[41m CHECKMATE \x1b[40m");
                                game.setWinner(message.moveBy);
                                game.setCheckmate();
                                return this.handleGameWon(game.gameId, game.player1, game.player2);
                            }
                            else {
                                console.log("\x1b[34m game is there but no user present \x1b[37m");
                            }
                            return;
                        }
                    }
                }
                else if (message.sendUser) {
                    this.users.get(message.sendUser)?.sendMessage({
                        type: MOVE,
                        payload: message.payload,
                        moves: message.moves
                    });
                }
                break;

            case INIT_GAME:
                if (!(message.gameId && message.WhitePlayer)) {
                    return;
                }
                const { WhitePlayer, gameId, player1, player2 } = message;
                if (this.games.has(gameId)) {
                    // it means that it's the same server so message has been send
                    return;
                }
                if (this.users.has(WhitePlayer)) {
                    redis.set(`userId:${WhitePlayer}`, gameId);
                    let user = this.users.get(WhitePlayer);
                    user?.setCurrentGame(gameId);
                    user?.sendMessage(
                        {
                            type: INIT_GAME,
                            gameId: gameId,
                            payload: {
                                color: 'white',
                                oponentId: player2
                            }
                        })
                    return;
                }
                break;

            case RESIGN_GAME:
                // {
                //     type: RESIGN_GAME,
                //     resigner: userId,
                //     gameId: gameId,
                // }
                if (!message.gameId) {
                    return;
                }
                if (this.games.has(message.gameId)) {
                    const game = this.games.get(message.gameId);
                    game?.resignGame(message.resigner);
                    pub.publish("game_channel", JSON.stringify({
                        type: GAME_OVER,
                        sendUser: game?.player1,
                        payload: {
                            winner: game?.isWon(),
                            result: game?.getResult()
                        }
                    }));
                    pub.publish("game_channel", JSON.stringify({
                        type: GAME_OVER,
                        sendUser: game?.player2,
                        payload: {
                            winner: game?.isWon(),
                            result: game?.getResult()
                        }
                    }));
                    redis.del(`gameId:${message.gameId}`);
                    redis.del(`userId:${game?.player1}`);
                    redis.del(`userId:${game?.player2}`);
                    this.games.get(message.gameId).destroy();
                    this.games.delete(message.gameId);
                }
                break;
            default:
                console.log("!!! UN KNOW MESSAGE IN PUBSUB !!!");
        }
    }
    // #endregion

    createGame(player1: string, player2: string, gameId: string) {
        const game = new Game(player1, player2, gameId);

        // Listen to game events
        game.on('timeExpired', this.handleTimeExpired.bind(this));
        game.on('gameOver', this.handleGameOver.bind(this));
        return game;
    }

    handleTimeExpired(event: { gameId: string, player: string }) {
        const { gameId, player } = event;
        const game = this.games.get(gameId);
        if (game) {
            game.setWinner(player);
            let result = game.setResult("timeover");
            let winner = game.setWinner(player);
            let p1 = this.users.get(game.player1);
            let p2 = this.users.get(game.player2);

            p1?.sendMessage({
                type: GAME_OVER,
                payload: { winner: winner, result: result }
            });
            p2?.sendMessage({
                type: GAME_OVER,
                payload: { winner: winner, result: result }
            });
            if (!p1) {
                pub.publish('game_channel', JSON.stringify({
                    type: MESSAGE_RELAY,
                    sendUser: game.player1,
                    payload: {
                        type: GAME_OVER,
                        payload: { winner: winner, result: result }
                    }
                }))
            }
            if (!p2) {
                pub.publish('game_channel', JSON.stringify({
                    type: MESSAGE_RELAY,
                    sendUser: game.player2,
                    payload: {
                        type: GAME_OVER,
                        payload: { winner: winner, result: result }
                    }
                }))
            }
            redis.del(`userId:${game.player1}`);
            redis.del(`userId:${game.player2}`);
            redis.del(`gameId:${gameId}`);
            this.games.delete(gameId);
            console.log(`Game ${gameId} ended due to time expiry. Winner: ${winner}`);
        }
    }

    handleGameOver(event: { gameId: string, winner: string }) {
        const { gameId, winner } = event;
        const game = this.games.get(gameId);
        if (game) {
            if (this.users.has(game.player1)) {
                this.users.get(game.player1)?.sendMessage({
                    type: GAME_OVER,
                    payload: { winner: winner, result: game.getResult() }
                });
            } else {
                pub.publish('game_channel', JSON.stringify({
                    type: MESSAGE_RELAY,
                    sendUser: game.player2,
                    payload: {
                        type: GAME_OVER,
                        payload: { winner: winner, result: game.getResult() }
                    }
                }));
            }
            if (this.users.has(game.player2)) {
                this.users.get(game.player2)?.sendMessage({
                    type: GAME_OVER,
                    payload: { winner: winner, result: game.getResult() }
                })
            }
            else {
                pub.publish('game_channel', JSON.stringify({
                    type: MESSAGE_RELAY,
                    sendUser: game.player2,
                    payload: {
                        type: GAME_OVER,
                        payload: { winner: winner, result: game.getResult() }
                    }
                }));
            }
            redis.del(`userId:${game.player2}`);
            redis.del(`userId:${game.player1}`);
            redis.del(`gameId:${gameId}`);
            this.games.get(gameId).destroy();
            this.games.delete(gameId);
            console.log(`Game ${gameId} ended. Winner: ${winner}`);
        }
    }

    async setUser(sessionData: SessionData, socket: WebSocket, token: string) {
        const { userId, username } = sessionData;
        const user = new User(socket, userId, username, token);
        const userKey = `userId:${userId}`;
        try {
            const gameId = await redis.get(userKey);
            console.log(`\x1b[41m GAME ID : ${gameId} \n userId: ${userId} \x1b[40m`);
            this.users.set(userId, user);
            console.log(`User set: ${username} (ID: ${userId}) (SIZE: ${this.users.size})`);
            if (gameId) {
                console.log("\x1b[31m RECONNECTION GAME \x1b[37m");
                return this.handleReconnection(gameId, user);
            }
        } catch (error) {
            console.error(`Error setting user: ${error}`);
        }
    }
    // sets user in game or as pending user

    async addUser(user: User) {
        const userIdKey = `userId:${user.userId}`;
        const pendingUserQueue = 'GlobalPendingUserQueue';
        const tempMatchKey = `tempMatch:${user.userId}`;

        // Check if the user is already in a game
        const gameId = await redis.get(userIdKey);
        if (gameId) {
            console.log("User is already in a game:", gameId);
            user.sendMessage({ type: 'error', message: "Cannot start two games" });
            return this.handleReconnection(gameId, user);
        }
        let pendingUser = null;
        // Try to temporarily store the popped pending user
        while (true) {
            const pending = await redis.rpop(pendingUserQueue);
            if (!pending) {
                pendingUser = null;
                break;
            }
            const game = await redis.get(`userId:${pending}`);
            if (!game) {
                pendingUser = pending;
                break;
            }
        }
        console.log("\xb1[42m  Pending user:", pendingUser, "\xb1[40m  ");

        if (pendingUser) {
            if (pendingUser === user.userId) {
                console.log("User is already in the pending queue.");
                return user.sendMessage({ type: 'error', message: "Cannot start two games" });
            }

            // Create a new game ID
            const newGameId = `${pendingUser}-${user.userId}-${Date.now()}`;
            await redis.set(userIdKey, newGameId);
            user.setCurrentGame(newGameId);

            // Create and store the new game
            const game = this.createGame(pendingUser, user.userId, newGameId);
            this.games.set(newGameId, game);
            redis.set(`gameId:${game.gameId}`, JSON.stringify(
                {
                    fen: game.getGameBoard(),
                    status: game.getStatus(),
                    moves: game.getMoves(),
                    player1: game.player1,
                    player2: game.player2,
                    gameId: gameId,
                    startTime: game.getStartTime()
                }));
            console.log(`\x1b[34m Game created: ${newGameId} between ${pendingUser} and ${user.userId} \x1b[37m`);
            // Notify the pending user
            const player1 = this.users.get(pendingUser);
            if (player1) {
                await redis.set(`userId:${pendingUser}`, newGameId);
                player1.setCurrentGame(newGameId);
                player1.sendMessage({
                    type: INIT_GAME,
                    gameId: newGameId,
                    payload: {
                        color: 'white',
                        oponentId: user.userId
                    }
                });
            } else {
                console.log("Published in pubsub");
                pub.publish("game_channel", JSON.stringify({
                    WhitePlayer: pendingUser,
                    type: INIT_GAME,
                    gameId: newGameId,
                    player1: pendingUser,
                    player2: user.userId
                }));
            }

            // Notify the current user
            return user.sendMessage({ type: INIT_GAME, gameId: newGameId, payload: { color: 'black', oponentId: pendingUser } });
        } else {
            // Re-add the user to the pending queue if no match was found
            const isReadded = await redis.lpush(pendingUserQueue, user.userId);
            console.log(`User ${user.userId} added back to the pending queue: ${isReadded}`);
            return user.sendMessage({ type: "wait" });
        }
    }




    async handleGameWon(gameId: string, player1: string, player2: string) {
        const game = this.games.get(gameId);
        const p1 = this.users.get(player1);
        const p2 = this.users.get(player2);
        if (game) {
            const message = { winner: game.isWon(), result: game.getResult() };
            p2?.sendMessage({
                type: GAME_OVER,
                payload: message
            })
            p1?.sendMessage({
                type: GAME_OVER,
                payload: message
            })
            if (!p1) {
                pub.publish("game_channel", JSON.stringify({
                    type: GAME_OVER,
                    sendUser: player1,
                    gameId: gameId, message: message
                }));
            } else {
                await redis.del(`userId:${player2}`);
            }
            if (!p2) {
                pub.publish("game_channel", JSON.stringify({
                    type: GAME_OVER,
                    sendUser: player2,
                    gameId: gameId,
                    message: message
                }));
            } else {
                await redis.del(`userId:${player2}`);
            }
            await redis.del(`userId:${game.player2}`);
            await redis.del(`userId:${game.player1}`);
            this.games.delete(game.gameId);

        }

    }

    userLostConnection(userId: string) {  // does not required 
        // Set a timeout to delete the user after 60 seconds]
        this.removeUser(userId);

    }

    removeUser(userId: string) {
        // just delete the user and let the game be when the user send a message use pubsub
        this.users.delete(userId);
        console.log("\x1b[41m USER DELETED \x1b[40m");

    }

    async handleReconnection(gameId: string, user: User) {
        //retrive data from game using db or cache layer
        console.log("\x1b[41m IN SIDE HANDLE RECONNECTION \x1b[40m");
        if (this.games.has(gameId)) {
            const game = this.games.get(gameId);
            console.log("\x1b[41m GAME FOUND AND MESSAGE SENT \x1b[40m");
            user?.sendMessage({
                type: GAME_RECONNCETED,
                gameId: gameId,
                payload: {
                    moves: game?.getMoves(),
                    color: game?.playerColor(user.userId),
                    startTime: game.getStartTime()
                }
            });
        } else {
            console.log(`\x1b[42m gameId:${gameId} \x1b[40m`);
            const gamePre = await redis.get(`gameId:${gameId}`);
            console.log(gamePre);
            if (gamePre) {
                const game = JSON.parse(gamePre);
                console.log({
                    type: GAME_RECONNCETED,
                    gameId: game.gameId,
                    payload: {
                        moves: game.moves,
                        color: user.userId === game.player1 ? 'white' : 'black',
                        startTime: game.startTime
                    }
                });
                user?.sendMessage({
                    type: GAME_RECONNCETED,
                    gameId: game.gameId,
                    payload: {
                        moves: game.moves,
                        color: user.userId === game.player1 ? 'white' : 'black',
                        startTime: game.startTime
                    }
                })
            } else {
                redis.del(`userId:${user.userId}`);
                // no such game in redis
                console.log("game not present");
            }
        }

    }

    handleMessage(message: any) {
        const { type, gameId, userId, move } = message;
        console.log(`Handling message: ${JSON.stringify(message)}`);
        let game = this.games.get(gameId);
        switch (type) {
            case GAME_RECONNCETED:
                const user = this.users.get(userId);
                if (!gameId) {
                    break;
                }
                this.handleReconnection(gameId, user)
                break;
            case INIT_GAME:  // MESSAGE FROM CLIENT TO START THE GAME
                try {
                    if (!userId) {
                        console.error("userId is missing in the message:", message);
                        return;
                    }

                    const user = this.users.get(userId);

                    if (!user) {
                        console.error(`User not found in the users map for userId: ${userId}`);
                        return;
                    }

                    console.log("user found:", user.userId);

                    if (user) {
                        return this.addUser(user);
                    }

                    console.log("USER NOT ADDED IN GAME");
                } catch (error) {
                    console.error("ERROR in INIT GAME ", error);
                }
                break;
            case MOVE:
                if (game) {
                    console.log("game found and inside Move");
                    try {
                        if (game.isWon()) {
                            return this.users.get(userId)?.sendMessage({ type: "error", payload: "game finished" });
                        }
                        game.makeMove(userId, move);
                        console.log("\x1b[41m store in redis : ", {
                            fen: game.getGameBoard(),
                            status: game.getStatus(),
                            moves: game.getMoves(),
                            player1: game.player1,
                            player2: game.player2,
                            gameId: gameId,
                            startTime: game.getStartTime()
                        }, '\x1b[40m');
                        redis.set(`gameId:${game.gameId}`, JSON.stringify(
                            {
                                fen: game.getGameBoard(),
                                status: game.getStatus(),
                                moves: game.getMoves(),
                                player1: game.player1,
                                player2: game.player2,
                                gameId: gameId,
                                startTime: game.getStartTime()
                            }));
                        if (userId == game.player1) {
                            if (this.users.get(game.player2)) {
                                this.users.get(game.player2)?.sendMessage({
                                    type: MOVE,
                                    payload: move,
                                    moves: game.getMoves()
                                });
                            } else {
                                pub.publish("game_channel", JSON.stringify({
                                    type: SENDMOVE,
                                    sendUser: game.player2,
                                    moveBy: game.player1,
                                    gameId: gameId,
                                    moves: game.getMoves(),
                                    payload: move
                                }));
                            }
                        }
                        else if (userId == game.player2) {
                            if (this.users.get(game.player1)) {
                                this.users.get(game.player1)?.sendMessage({
                                    type: MOVE,
                                    payload: move,
                                    moves: game.getMoves()
                                });
                            } else {
                                pub.publish("game_channel", JSON.stringify({
                                    type: MESSAGE_RELAY,
                                    sendUser: game.player1,
                                    moveBy: game.player2,
                                    gameId: gameId,
                                    moves: game.getMoves(),
                                    payload: {
                                        type: MOVE,
                                        payload: move,
                                        moves: game.getMoves()
                                    }
                                }));
                            }
                        }
                        if (game.getGame().isGameOver()) {
                            console.log("\x1b[41m CHECKMATE \x1b[40m");
                            game.setWinner(userId);
                            game.setCheckmate();
                            return this.handleGameWon(gameId, game.player1, game.player2);
                        }
                    } catch {
                        this.users.get(userId)?.sendMessage({ type: "ERROR" });
                    }
                    console.log(`\x1b[41m Move made in game: ${gameId} by user: ${userId} \x1b[40m`);
                    return;
                } else { //when white will find that it has no game then it will publish or maybe a reconnected black
                    console.log(`\x1b[44m GAME WAS NOT FOUND SO PUBLISHED \x1b[40m`);
                    pub.publish("game_channel", JSON.stringify({
                        type: SENDMOVE,
                        moveBy: userId,
                        gameId: gameId,
                        payload: move
                    }));
                }
                break;

            case RESIGN_GAME:
                if (game) {
                    try {
                        game.resignGame(userId);

                        this.users.get(userId)?.sendMessage({
                            type: GAME_OVER,
                            payload: { winner: game.playerColor(userId) == 'black' ? 'white' : 'black' }
                        })
                        let p2 = game.player1 == userId ? game.player2 : game.player1;
                        if (this.users.has(p2)) {
                            let player2 = this.users.get(p2);
                            player2?.setCurrentGame(null);
                            redis.del(`userId:${player2?.userId}`);
                            player2?.sendMessage({
                                type: GAME_OVER,
                                gameId: gameId,
                                payload: {
                                    winner: game.playerColor(userId) == 'black' ? 'white' : 'black',
                                    result: game.getResult()
                                }
                            });
                        } else {
                            pub.publish("game_channel", JSON.stringify({
                                type: MESSAGE_RELAY,
                                resigner: userId,
                                gameId: gameId,
                                sendUser: p2,
                                payload: {
                                    type: GAME_OVER,
                                    payload: {
                                        winner: game.playerColor(userId) == 'black' ? 'white' : 'black',
                                        result: game.getResult()
                                    }
                                }
                            }));
                        }
                        redis.del(`userId:${game.player2}`);
                        redis.del(`userId:${game.player1}`);
                        redis.del(`gameId:${game.gameId}`);
                        this.games.get(gameId).destroy();
                        console.log("this is size :", this.games.size);
                        this.games.delete(gameId);
                        console.log("this is size :", this.games.size);
                        console.log(`Game resigned: ${gameId} by user: ${userId}`);
                    } catch (error) {
                        console.log("ERROR IN CASE RESIGN:", error);
                    }
                } else {
                    pub.publish("game_channel", JSON.stringify({
                        type: RESIGN_GAME,
                        resigner: userId,
                        gameId: gameId,
                    }));
                }
                break;
            default:
                if (this.users.has(userId)) {
                    this.users.get(userId)?.sendMessage({ type: "error", message: "404" });
                }
        }
    }
}
