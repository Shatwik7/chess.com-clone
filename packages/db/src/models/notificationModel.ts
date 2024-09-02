

import mongoose, { Schema, Document } from 'mongoose';
import { User } from './userModel';

interface Notification extends Document {
  user: User;
  message: string;
  read: boolean;
  createdAt: Date;
}

const notificationSchema = new Schema<Notification>({
  user: { type:Schema.Types.ObjectId, required: true ,ref:"User" },
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

const NotificationModel = mongoose.model<Notification>('Notification', notificationSchema);

export { NotificationModel, Notification };
