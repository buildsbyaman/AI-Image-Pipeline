import mongoose, { Schema, Document, Types } from 'mongoose';

export enum NotificationStatus {
  PENDING = 'PENDING',
  SENT = 'SENT',
  FAILED = 'FAILED'
}

export interface INotification extends Document {
  userId: string;
  email: string;
  type: string;
  subject: string;
  message: string;
  status: NotificationStatus;
  provider: string;
  error?: string;
  read: boolean;
  jobId?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema: Schema = new Schema({
  userId: { type: String, required: true },
  email: { type: String, required: true },
  type: { type: String, required: true },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  status: { type: String, enum: Object.values(NotificationStatus), default: NotificationStatus.PENDING },
  provider: { type: String, default: 'resend' },
  error: { type: String },
  read: { type: Boolean, default: false },
  jobId: { type: Schema.Types.ObjectId, ref: 'Job' },
}, {
  timestamps: true,
  toJSON: {
    transform: (_, ret: any) => {
      ret.id = ret._id.toString();
      delete ret._id;
      delete ret.__v;
    }
  }
});

export const Notification = mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema);
