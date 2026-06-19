import mongoose, { Schema, Document, Types } from 'mongoose';

export type FileStatus = 'pending' | 'confirmed';

export interface IFile extends Document {
  key: string;
  url: string;
  originalName: string;
  mimeType: string;
  size: number;
  status: FileStatus;
  userId?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const FileSchema: Schema = new Schema({
  key: { type: String, required: true, unique: true },
  url: { type: String, required: true },
  originalName: { type: String, required: false, default: '' },
  mimeType: { type: String, required: true },
  size: { type: Number, required: false, default: 0 },
  status: { type: String, enum: ['pending', 'confirmed'], default: 'pending' },
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
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

export const File = mongoose.models.File || mongoose.model<IFile>('File', FileSchema);

