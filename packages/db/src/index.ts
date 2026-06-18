import mongoose from 'mongoose';

export * from './schemas/User';
export * from './schemas/File';
export * from './schemas/Job';
export * from './schemas/Result';
export * from './schemas/Notification';

export const connectToDatabase = async (uri: string) => {
  if (mongoose.connection.readyState >= 1) return;
  return mongoose.connect(uri);
};

export const disconnectFromDatabase = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
};
