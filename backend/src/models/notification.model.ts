import mongoose, { Document, Schema } from 'mongoose';
import { UserRole } from './auth.model';

export interface INotification extends Document {
  title: string;
  message: string;
  type: 'info' | 'warning' | 'announcement' | 'fee_due';
  targetRoles: UserRole[];
  createdBy: mongoose.Types.ObjectId;
  readBy: string[]; // userId strings
  createdAt: Date;
  updatedAt: Date;
}

export interface IPushSubscription extends Document {
  userId: string;
  role: UserRole;
  subscription: {
    endpoint: string;
    keys: { p256dh: string; auth: string };
  };
  createdAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    title: { type: String, required: true, maxlength: 120, trim: true },
    message: { type: String, required: true, maxlength: 1000, trim: true },
    type: { type: String, enum: ['info', 'warning', 'announcement', 'fee_due'], default: 'info' },
    targetRoles: [{ type: String, enum: ['admin', 'faculty', 'student'] }],
    createdBy: { type: Schema.Types.ObjectId, ref: 'Auth', required: true },
    readBy: [{ type: String }],
  },
  { timestamps: true }
);

// Index for efficient per-role queries
notificationSchema.index({ targetRoles: 1, createdAt: -1 });

const pushSubscriptionSchema = new Schema<IPushSubscription>(
  {
    userId: { type: String, required: true, unique: true },
    role: { type: String, enum: ['admin', 'faculty', 'student'], required: true },
    subscription: {
      endpoint: { type: String, required: true },
      keys: {
        p256dh: { type: String, required: true },
        auth: { type: String, required: true },
      },
    },
  },
  { timestamps: true }
);

export const Notification = mongoose.model<INotification>('Notification', notificationSchema);
export const PushSubscription = mongoose.model<IPushSubscription>('PushSubscription', pushSubscriptionSchema);
