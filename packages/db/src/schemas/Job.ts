import mongoose, { Schema, Document, Types } from 'mongoose';

export enum JobStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  W1 = 'W1',
  W2 = 'W2',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED'
}

export interface IJob extends Document {
  userId: Types.ObjectId;
  fileKey: string;
  status: JobStatus;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

const JobSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  fileKey: { type: String, required: true },
  status: { type: String, enum: Object.values(JobStatus), default: JobStatus.PENDING },
  error: { type: String },
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

export const Job = mongoose.models.Job || mongoose.model<IJob>('Job', JobSchema);
