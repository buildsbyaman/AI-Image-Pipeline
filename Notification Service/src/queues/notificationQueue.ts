import { Queue } from 'bullmq';
import { env } from '../config/env';

export const connection = {
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
};

export const notificationQueue = new Queue('notifications', {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
    removeOnComplete: true,
    removeOnFail: false,
  },
});
