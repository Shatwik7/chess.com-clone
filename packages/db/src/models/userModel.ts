import mongoose, { Schema, Document } from 'mongoose';
import { Game } from './gameModel';

interface User extends Document {
  name: string;
  email: string;
  password: string;
  rating: number;
  friends?: User[];
  games?: Game[];
  online: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<User>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  rating: { type: Number, default: 1200 },
  friends: [{type: Schema.Types.ObjectId, ref: 'User'}],
  games:[{type:Schema.Types.ObjectId,ref:"Game"}],
  online: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const UserModel = mongoose.model<User>('User', userSchema);

export { UserModel, User };