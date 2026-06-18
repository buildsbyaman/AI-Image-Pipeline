import { Worker, Job } from 'bullmq';
import { connection } from './email.queue';
import { EmailService } from './email.service';
import { renderTemplate } from '../../shared/utils/templateEngine';
import { logger } from '../../shared/utils/logger';

const emailService = new EmailService();

export interface EmailJobPayload {
  to: string;
  userName: string;
  type: 'IMAGE_PROCESSED_SUCCESS' | 'ADULT_CONTENT_FLAGGED';
  jobId: string;
  category?: string;
}

export const emailWorker = new Worker(
  'email-queue',
  async (job: Job<EmailJobPayload>) => {
    const { to, userName, type, jobId, category } = job.data;
    
    logger.info(`[Email System] Processing email job ${job.id} of type ${type} to ${to}`);

    try {
      let subject = '';
      let html = '';

      if (type === 'IMAGE_PROCESSED_SUCCESS') {
        subject = 'Image Processed Successfully';
        html = renderTemplate('image-processed-successfully', 'html', {
          USER_NAME: userName,
          JOB_ID: jobId,
        });
      } else if (type === 'ADULT_CONTENT_FLAGGED') {
        subject = 'Content Warning: Image Flagged';
        html = renderTemplate('adult-content-flagged', 'html', {
          USER_NAME: userName,
          JOB_ID: jobId,
          FLAGGED_CATEGORY: category || 'adult',
        });
      } else {
        logger.error(`[Email System] Unknown email job type: ${type}`);
        return;
      }

      await emailService.sendEmail(to, subject, html);
      logger.info(`[Email System] Successfully sent email for job ${jobId} to ${to}`);
    } catch (error: any) {
      logger.error(`[Email System] Failed to process email job ${job.id}: ${error.message}`);
      throw error;
    }
  },
  {
    connection,
    concurrency: 5,
  }
);

emailWorker.on('failed', (job, err) => {
  if (job) {
    logger.error(`[Email System] Job ${job.id} failed with error: ${err.message}`);
  }
});

emailWorker.on('completed', (job) => {
  logger.info(`[Email System] Job ${job.id} has completed!`);
});
