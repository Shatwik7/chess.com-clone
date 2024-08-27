const WebSocket = require('ws');
const url = 'ws://localhost:8080?token=5a0fbe0f-caf9-4079-8a36-d6c86a2bf79d';  // Replace with your WebSocket server URL

function startGame(player1Id, player2Id) {
    const ws1 = new WebSocket(url);
    const ws2 = new WebSocket(url);

    ws1.on('open', () => {
        ws1.send(JSON.stringify({ type: 'start', userId: player1Id }));
        simulateMoves(ws1, player1Id);
    });

    ws2.on('open', () => {
        ws2.send(JSON.stringify({ type: 'start', userId: player2Id }));
        simulateMoves(ws2, player2Id);
    });
}

function simulateMoves(ws, playerId) {
    let moveCount = 0;
    const moves = [ /* Array of moves like { from: 'e2', to: 'e4' } */ ];

    const moveInterval = setInterval(() => {
        if (moveCount >= moves.length) {
            clearInterval(moveInterval);
            ws.close();
            return;
        }

        ws.send(JSON.stringify({ type: 'move', userId: playerId, move: moves[moveCount] }));
        moveCount++;
    }, 1000); // Send a move every second
}

// Start multiple games
for (let i = 0; i < 500; i++) {  // Adjust this number based on desired load
    startGame(`player1-${i}`, `player2-${i}`);
}