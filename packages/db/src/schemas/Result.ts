import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IResult extends Document {
  jobId: Types.ObjectId;
  caption?: string;
  labels: string[];
  flagged: boolean;
  flaggedCategory?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ResultSchema: Schema = new Schema({
  jobId: { type: Schema.Types.ObjectId, ref: 'Job', required: true, unique: true },
  caption: { type: String },
  labels: { type: [String], default: [] },
  flagged: { type: Boolean, default: false },
  flaggedCategory: { type: String },
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

export const Result = mongoose.models.Result || mongoose.model<IResult>('Result', ResultSchema);
