// src/models/gameModel.ts

import mongoose, { Schema, Document } from 'mongoose';
import { Move } from './moveModel';
interface Game extends Document {
  gameId: string;
  player1Id: string;
  player2Id: string;
  startTime: Date;
  endTime?: Date;
  result: 'win' | 'draw' | 'loss';
  moves: Move[];
}

const gameSchema = new Schema<Game>({
  gameId: { type: String, required: true, unique: true },
  player1Id: { type: String, required: true },
  player2Id: { type: String, required: true },
  startTime: { type: Date, default: Date.now },
  endTime: { type: Date },
  result: { type: String, enum: ['win', 'draw', 'loss'], required: true },
  moves: [{ type: Schema.Types.ObjectId, ref: 'Move' }],
});

const GameModel = mongoose.model<Game>('Game', gameSchema);

export { GameModel, Game };
