import React from "react";

interface TimerProps {
    time: number;
    color: "white" | "black";
}

const Timer: React.FC<TimerProps> = ({ time, color }) => {
    const minutes = Math.floor(time / 60000);
    const seconds = Math.floor((time % 60000) / 1000);

    return (
        <div className={`timer ${color}`}>
            {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
        </div>
    );
};

export default Timer;
