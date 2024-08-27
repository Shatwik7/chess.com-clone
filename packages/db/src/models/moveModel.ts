// src/models/moveModel.ts

import mongoose, { Schema, Document } from 'mongoose';

interface Move extends Document {
  moveId: string;
  gameId: string;
  playerId: string;
  move: string;
  timestamp: Date; 
}

const moveSchema = new Schema<Move>({
  moveId: { type: String, required: true, unique: true },
  gameId: { type: String, required: true },
  playerId: { type: String, required: true },
  move: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const MoveModel = mongoose.model<Move>('Move', moveSchema);

export { MoveModel, Move };
