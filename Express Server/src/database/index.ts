import mongoose from 'mongoose';

export * from './schemas/User';
export * from './schemas/File';
export * from './schemas/Job';
export * from './schemas/Result';
export * from './schemas/Notification';

export const connectToDatabase = async (uri: string) => {
  if (mongoose.connection.readyState >= 1) return;
  const connection = await mongoose.connect(uri);
  try {
    // Drop the old unique key index if it exists, to allow key deduplication
    await mongoose.connection.collection('files').dropIndex('key_1');
  } catch (err) {
    // Index may not exist or is already dropped
  }
  return connection;
};

export const disconnectFromDatabase = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
};
