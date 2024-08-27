

import mongoose, { Schema, Document } from 'mongoose';

interface Notification extends Document {
  notificationId: string; // Unique identifier for the notification
  userId: string; // ID of the user receiving the notification
  message: string; // Notification message
  read: boolean; // Whether the notification has been read
  createdAt: Date; // When the notification was created
}

const notificationSchema = new Schema<Notification>({
  notificationId: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

const NotificationModel = mongoose.model<Notification>('Notification', notificationSchema);

export { NotificationModel, Notification };
