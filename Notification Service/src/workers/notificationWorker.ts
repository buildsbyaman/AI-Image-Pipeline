import { Worker, Job } from 'bullmq';
import { connection } from '../queues/notificationQueue';
import { EmailService } from '../services/EmailService';
import { NotificationRepository } from '../repositories/NotificationRepository';
import { logger } from '../utils/logger';

const emailService = new EmailService();
const repository = new NotificationRepository();

export const notificationWorker = new Worker(
  'notifications',
  async (job: Job) => {
    const { notificationId, email, message } = job.data;
    
    logger.info(`Processing job ${job.id} for notification ${notificationId}`);

    try {
      await emailService.sendNotification(email, message);
      await repository.updateStatus(notificationId, 'SENT');
      logger.info(`Successfully processed job ${job.id}`);
    } catch (error: any) {
      logger.error(`Failed to process job ${job.id}: ${error.message}`);
      await repository.updateStatus(notificationId, 'FAILED', error.message);
      throw error; // Let BullMQ handle retries
    }
  },
  {
    connection,
    concurrency: 5, // Process 5 jobs concurrently
  }
);

notificationWorker.on('failed', (job, err) => {
  if (job) {
    logger.error(`Job ${job.id} failed with error: ${err.message}`);
  }
});

notificationWorker.on('completed', (job) => {
  logger.info(`Job ${job.id} has completed!`);
});
