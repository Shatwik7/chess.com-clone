import mongoose, { Schema, Document } from 'mongoose';

interface User extends Document {
  userId: string;
  name: string;
  email: string;
  password: string;
  rating: number;
  friends?: string[];
  online: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<User>({
  userId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  rating: { type: Number, default: 1200 },
  friends: { type: [String], default: [] },
  online: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const UserModel = mongoose.model<User>('User', userSchema);

export { UserModel, User };