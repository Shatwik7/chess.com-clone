// src/models/gameModel.ts

import mongoose, { Schema, Document } from 'mongoose';
import { Move } from './moveModel';
import { User } from './userModel';

interface Game extends Document {
  player1: User;
  player2: User;
  startTime: Date;
  endTime?: Date;
  gameTime: number;
  result: "process" | "stalemate" | "insufficient_material" | "checkmate" | "timeover" | "resign" | "hand_shake_draw" | "threefold_repetition";
  status: "created" | "process" | "gameOver";
  winner: "black" | "white" | "draw" | null;
  moves: Move[];
}

const gameSchema = new Schema<Game>({
  player1: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  player2: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  startTime: { type: Date, default: Date.now },
  endTime: { type: Date },
  gameTime: { type: Number, enum: [1, 3, 5, 10], required: true },
  status: {
    type: String,
    enum: ["created", "process", "gameOver"],
    default: "created"
  },
  winner: {
    type: String,
    enum: ["black", "white", "draw"],
    default: null
  },
  result: {
    type: String,
    enum: ["process", "stalemate", "insufficient_material", "checkmate", "timeover", "resign", "hand_shake_draw", "threefold_repetition"],
    default: 'process',
    required: true
  },
  moves: [{ type: Schema.Types.ObjectId, ref: 'Move' }],
});

const GameModel = mongoose.model<Game>('Game', gameSchema);

export { GameModel, Game };
