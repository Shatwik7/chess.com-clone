// src/models/moveModel.ts

import mongoose, { Schema, Document } from 'mongoose';
import { Game } from './gameModel';
import { User } from './userModel';

interface Move extends Document {
  game:Game
  player: User;
  to:string;
  from:string;
  timestamp: Date;
}

const moveSchema = new Schema<Move>({
  game: { type: Schema.Types.ObjectId, required: true ,ref: 'Game'},
  player: {type: Schema.Types.ObjectId, required: true ,ref: 'User' },
  to: { type: String, required: true },
  from: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const MoveModel = mongoose.model<Move>('Move', moveSchema);

export { MoveModel, Move };
