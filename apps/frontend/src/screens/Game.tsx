import React, { useState, useEffect } from "react";
import { Chessboard } from "react-chessboard";
import { useSocket } from "../hooks/useSocket";
import LoadingSpinner from "../components/LoadingSpinner";
import { Chess, Square } from "chess.js";
import FlashMessage from "../components/FlashMessage";
import PlayerInfo from "../components/PlayerInfo";
import "./Game.css";
import GameControlPanel from "../components/GameControlPanel";
import ResultCard from "../components/ResultCard";
import calculateRemainingTime from "../util/calculateRemainingTime";



const Game: React.FC = () => {
    const [game, setGame] = useState(new Chess());
    const [gameId, setGameId] = useState<string | null>(null);
    const [gameStarted, setGameStarted] = useState(false);
    const [userColor, setUserColor] = useState<"white" | "black">("white");
    const [fen, setFen] = useState(game.fen());
    const [gameOver, setGameOver] = useState(false);
    const [winner, setWinner] = useState<"black" | "white" | null>(null);
    const [flashMessage, setFlashMessage] = useState<{ message: string; type: "success" | "error" } | null>(null);
    const ws = useSocket();
    const [gameHistory, setGameHistory] = useState<string[]>([]);
    const [selectedTime, setSelectedTime] = React.useState('5min');
    const [opponentTimeLeft, setOpponentTimeLeft] = useState<number>(600); // in seconds
    const [userTimeLeft, setUserTimeLeft] = useState<number>(600); // in seconds
    const [opponentInterval, setOpponentInterval] = useState<NodeJS.Timeout | null>(null);
    const [userInterval, setUserInterval] = useState<NodeJS.Timeout | null>(null);
    const [customStyles, setCustomStyles] = useState({});
    const [gameTime, setgameTime] = useState(60);
    const handleTimeChange = (time: any) => {
        setSelectedTime(time);
    };
    const closeFlashMessage = () => {
        setFlashMessage(null);
    };
    function king_square(game: Chess, color: 'w' | 'b'): String | null {
        let fen = game.fen();
        const rows = fen.split(' ')[0].split('/'); // Get the board part of the FEN and split into rows

        for (let row = 0; row < rows.length; row++) {
            let file = 0;
            for (let col = 0; col < rows[row].length; col++) {
                const char = rows[row][col];
                let piece;

                if (char >= '1' && char <= '8') {
                    // If the character is a number, it represents empty squares
                    file += parseInt(char, 10);
                } else {
                    piece = char;
                    if (
                        (color === 'w' && piece === piece.toUpperCase() && piece.toLowerCase() === 'k') ||
                        (color === 'b' && piece === piece.toLowerCase() && piece.toUpperCase() === 'K')
                    ) {
                        // Convert file and row to algebraic notation
                        const fileLetter = String.fromCharCode(97 + file); // Convert column index to chess file (a-h)
                        const rank = 8 - row; // Convert row index to chess rank (1-8)
                        return `${fileLetter}${rank}`; // Return the position in algebraic notation
                    }
                    file++; // Move to the next file
                }
            }
        }
        return null; // Return null if no king is found (shouldn't happen in a valid FEN)
    }
    const highlightCheckSquare = (game: Chess) => {
        if (game.isCheck()) {
            let kingPosition = game.turn() === "w" ? king_square(game, "w") : king_square(game, "b");
            setCustomStyles({
                [kingPosition]: {
                    backgroundColor: "red",
                    border: "2px solid red",
                },
            });
        } else {
            setCustomStyles({});
        }
    };
    function reconnect() {
        ws?.send(JSON.stringify({ type: 'game_reconnected', gameId: gameId }));
    }
    useEffect(() => {
        let pingInterval: number | null = null;

        if (ws) {

            ws.onmessage = (event) => {
                const message = JSON.parse(event.data);
                const { type, payload, gameId } = message;
                console.log(message);

                if (type === "init_game") {
                    if (gameId) {
                        setGameId(gameId);
                    }
                    setgameTime(60);
                    setUserTimeLeft(60);
                    setOpponentTimeLeft(60);
                    if (payload.color == 'white') {
                        const interval = setInterval(() => {
                            setUserTimeLeft((prevTime) => Math.max(prevTime - 1, 0));
                        }, 1000);
                        setUserInterval(interval);
                    } else {
                        const interval = setInterval(() => {
                            setOpponentTimeLeft((prevTime) => Math.max(prevTime - 1, 0));
                        }, 1000);
                        setOpponentInterval(interval);
                    }
                    setGame(new Chess());
                    setFen(new Chess().fen());
                    setUserColor(payload.color);
                    setGameStarted(true);
                }

                if (type === "move") {
                    try {
                        const move = { from: payload.from, to: payload.to };
                        console.log('moves :', JSON.stringify(message.moves));
                        const newGame = new Chess(game.fen());
                        const moveResult = newGame.move(move);
                        setOpponentInterval(null);
                        if (!moveResult) {
                            return;
                        }
                        if(opponentInterval) clearInterval(opponentInterval);
                        const interval = setInterval(() => {
                            setUserTimeLeft((prevTime) => Math.max(prevTime - 1, 0));
                        }, 1000);
                        setUserInterval(interval);
                        game.move(move);
                        setGameHistory(game.history());
                        setFen(newGame.fen());
                        highlightCheckSquare(newGame);
                    } catch (error) {
                        console.log(error);
                        reconnect();
                    }
                }

                if (type === "game_over") {
                    if(userInterval) clearInterval(userInterval);
                    if(opponentInterval) clearInterval(opponentInterval);
                    setGameOver(true);
                    setWinner(payload.winner);
                }
                if (type === "game_reconnected") {
                    setGameId(gameId);
                    setUserColor(payload.color);
                    setGameStarted(true);
                    setgameTime(60);
                    const newGame = new Chess();
                    payload.moves.forEach((move: { to: string; from: string }) => newGame.move(move));
                    setGame(newGame);
                    const remainingTime = calculateRemainingTime(payload.startTime, gameTime, payload.moves, new Date().toISOString());
                    const { whiteTimeLeft, blackTimeLeft } = remainingTime;
                    if (payload.color == 'white') {
                        setUserTimeLeft(whiteTimeLeft);
                        setOpponentTimeLeft(blackTimeLeft);
                        if (newGame.turn() == 'w') {
                            const interval = setInterval(() => {
                                setUserTimeLeft((prevTime) => Math.max(prevTime - 1, 0));
                            }, 1000);
                            setUserInterval(interval);
                        } else {
                            const interval = setInterval(() => {
                                setOpponentTimeLeft((prevTime) => Math.max(prevTime - 1, 0));
                            }, 1000);
                            setOpponentInterval(interval);
                        }

                    } else {
                        setUserTimeLeft(blackTimeLeft);
                        setOpponentTimeLeft(whiteTimeLeft);
                        if (newGame.turn() == 'b') {
                            const interval = setInterval(() => {
                                setUserTimeLeft((prevTime) => Math.max(prevTime - 1, 0));
                            }, 1000);
                            setUserInterval(interval);
                        } else {
                            const interval = setInterval(() => {
                                setOpponentTimeLeft((prevTime) => Math.max(prevTime - 1, 0));
                            }, 1000);
                            setOpponentInterval(interval);
                        }
                    }

                    if (newGame.isGameOver()) {
                        setGameOver(true);
                        setWinner(newGame.turn() === "b" ? "white" : "black");
                    }

                    setFen(newGame.fen());
                    setGameHistory(newGame.history());
                    highlightCheckSquare(newGame);
                }
            };

            pingInterval = setInterval(() => {
                ws.send(JSON.stringify({ type: "ping" }));
            }, 30000); // Ping every 30 seconds
        }

        return () => {
            if (pingInterval) {
                clearInterval(pingInterval);
            }
        };
    }, [ws, game, fen]);

    if (!ws) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-100">
                <LoadingSpinner />
            </div>
        );
    }

    const handleMove = (sourceSquare: Square, targetSquare: Square, promotion: string) => {
        try {
            const piece = game.get(sourceSquare);

            if (!piece || (piece.color === "w" && userColor !== "white") || (piece.color === "b" && userColor !== "black")) {
                return false;
            }

            if ((game.turn() === "w" && userColor !== "white") || (game.turn() === "b" && userColor !== "black")) {
                return false;
            }

            if (promotion === "wQ" || promotion === "bQ") {
                promotion = "q";
            } else if (promotion === "wB" || promotion === "bB") {
                promotion = "b";
            } else if (promotion === "wN" || promotion === "bN") {
                promotion = "n";
            } else if (promotion === "wR" || promotion === "bR") {
                promotion = "r";
            }

            const move = game.move({
                from: sourceSquare,
                to: targetSquare,
                promotion: promotion,
            });

            if (move === null) {
                return false;
            }
            clearInterval(userInterval);
            const interval = setInterval(() => {
                setOpponentTimeLeft((prevTime) => Math.max(prevTime - 1, 0));
            }, 1000);
            setOpponentInterval(interval);
            setFen(game.fen());
            if (ws) {
                const message = JSON.stringify({
                    type: "move",
                    gameId: gameId,
                    move: { from: sourceSquare, to: targetSquare, promotion: promotion },
                });
                ws.send(message);
                setGameHistory(game.history());
            }
            highlightCheckSquare(game);
            return true;
        } catch (error) {
            console.log(error);
            reconnect()
        }
    };

    const handleStartGame = () => {
        try {
            ws.send(JSON.stringify({ type: "init_game" }));
            setFlashMessage({ message: "Waiting for opponent", type: "success" });
            setGameStarted(false);
            setGameOver(false);
        } catch (error) {
            setFlashMessage({ message: "Server is down, try later", type: "error" });
        }
    };

    const handleResign = () => {
        if (!gameId) return;
        ws.send(JSON.stringify({ type: "resign_game", gameId: gameId }));
    };

    return (
        <div className="medieval-background flex flex-col md:flex-row">
            {/* Left Column */}
            <div className="flex flex-col items-center w-full p-4 mt-10 md:ml-40 ml-0 space-y-0">
                <div className="flex flex-col items-center space-y-0" style={{ width: 500 }}>
                    <PlayerInfo
                        profilePic={"https://images.chesscomfiles.com/uploads/v1/user/66746050.a6b81e25.200x200o.1dc158a202fd.png"}
                        name="Wendy"
                        rating={1500}
                        timeLeft={new Date(opponentTimeLeft * 1000).toISOString().substr(14, 5)}
                        capturedPieces={["w-bishop", "w-knight", "w-queen"]}
                        score="+8"
                    />
                </div>
                <div className="flex justify-center" style={{ width: 500 }}>
                    <div className="flex flex-col items-center">
                        {gameStarted ? (
                            <Chessboard
                                position={fen}
                                onPieceDrop={(sourceSquare, targetSquare, promotion) =>
                                    handleMove(sourceSquare as Square, targetSquare as Square, promotion)
                                }
                                boardWidth={500}
                                boardOrientation={userColor}
                                customSquareStyles={customStyles}
                            />
                        ) : (
                            <Chessboard boardWidth={500} boardOrientation={userColor} />
                        )}
                    </div>
                    <div>
                        {gameOver ? (<ResultCard
                            winner={{ img: 'https://images.chesscomfiles.com/uploads/v1/user/66746050.a6b81e25.200x200o.1dc158a202fd.png', name: "Shatwik" }}
                            defeated={{ img: 'https://images.chesscomfiles.com/uploads/v1/user/66746050.a6b81e25.200x200o.1dc158a202fd.png', name: "Shatwik" }}
                            onClose={() => { console.log("closed") }}
                            onNextGame={() => { handleStartGame }}
                            onRematch={() => { console.log("closed") }} />) : <></>}
                    </div>
                </div>
                <div className="flex flex-col items-center space-y-0" style={{ width: 500 }}>
                    <PlayerInfo
                        profilePic="https://images.chesscomfiles.com/uploads/v1/user/66746050.a6b81e25.200x200o.1dc158a202fd.png"
                        name="Player 2"
                        rating={1500}
                        timeLeft={new Date(userTimeLeft * 1000).toISOString().substr(14, 5)}
                        capturedPieces={["w-bishop", "w-knight", "w-queen"]}
                        score="+8"
                    />
                </div>
            </div>
            {/* Right Column */}
            <div className="flex flex-col items-center w-full p-4 mt-10">
                <GameControlPanel
                    gameStarted={gameStarted}
                    handleStartGame={handleStartGame}
                    gameHistory={gameHistory}
                    handleResign={handleResign}
                    handleTimeChange={handleTimeChange}
                    selectedTime={selectedTime}
                /></div>
            {flashMessage && (
                <FlashMessage
                    message={flashMessage.message}
                    type={flashMessage.type}
                    onClose={closeFlashMessage}
                />
            )}
        </div>


    );
};

export default Game;
