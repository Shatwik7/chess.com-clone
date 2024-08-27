interface Move {
    from: string;
    to: string;
    promotion: string;
    timestamp: string;
}

interface GameTimeResult {
    whiteTimeLeft: number;
    blackTimeLeft: number;
}

function calculateRemainingTime(
    startTime: string,
    gameTimeInSeconds: number,
    moves: Move[],
    currentTime: string // Add the current time as an argument
): GameTimeResult {
    let whiteTimeLeft = gameTimeInSeconds;
    let blackTimeLeft = gameTimeInSeconds;

    let previousTimestamp = new Date(startTime).getTime();
    let currentTurn = "w"; // White starts first

    moves.forEach((move) => {
        const moveTimestamp = new Date(move.timestamp).getTime();
        const timeTaken = (moveTimestamp - previousTimestamp) / 1000; // Convert to seconds

        if (currentTurn === "w") {
            whiteTimeLeft = Math.max(whiteTimeLeft - timeTaken, 0);
            currentTurn = "b";
        } else {
            blackTimeLeft = Math.max(blackTimeLeft - timeTaken, 0);
            currentTurn = "w";
        }

        previousTimestamp = moveTimestamp;
    });

    // Calculate the time for the last move up to the current time
    const currentTimestamp = new Date(currentTime).getTime();
    const lastMoveTimeTaken = (currentTimestamp - previousTimestamp) / 1000;

    if (currentTurn === "w") {
        whiteTimeLeft = Math.max(whiteTimeLeft - lastMoveTimeTaken, 0);
    } else {
        blackTimeLeft = Math.max(blackTimeLeft - lastMoveTimeTaken, 0);
    }

    return {
        whiteTimeLeft,
        blackTimeLeft,
    };
}

export default calculateRemainingTime;