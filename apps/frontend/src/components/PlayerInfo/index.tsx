import React from "react";
import './PlayerInfo.css';
interface PlayerInfoProps {
    profilePic: string;
    name: string;
    rating: number;
    timeLeft: string;
    capturedPieces: string[];
    score: string;
}

const PlayerInfo: React.FC<PlayerInfoProps> = ({ profilePic, name, rating, timeLeft }) => (
    <div className="player-info-container">
        <div className="player-info-left">
            <div className="player-time-left">{timeLeft}</div>
        </div>
        <div className="player-info-right">
            <img
                alt={name}
                className="player-avatar"
                src={profilePic}
                srcSet={`${profilePic}, ${profilePic}@2x.png 2x`}
            />
            <div className="player-details">
                <span className="player-name">{name}</span>
                <span className="player-rating">({rating})</span>
            </div>
        </div>
    </div>
);

export default PlayerInfo;
