import { EmailService } from '../src/services/EmailService';
import { renderTemplate } from '../src/utils/templateEngine';
import { logger } from '../src/utils/logger';

const run = async () => {
  const emailService = new EmailService();
  const to = 'amankumarunofficial2810@gmail.com';

  try {
    // 1. Adult Content Flagged
    const html1 = renderTemplate('adult-content-flagged', 'html', {
      USER_NAME: 'Aman Kumar',
      JOB_ID: 'job-5d7f8a9',
      FLAGGED_CATEGORY: 'Explicit Content',
    });
    const text1 = renderTemplate('adult-content-flagged', 'txt', {
      USER_NAME: 'Aman Kumar',
      JOB_ID: 'job-5d7f8a9',
      FLAGGED_CATEGORY: 'Explicit Content',
    });

    await emailService.sendEmail(to, '⚠️ Content Review Required - Upload Flagged', html1, text1);
    logger.info('Successfully sent Adult Content Flagged email');

    // 2. Image Processed Successfully
    const html2 = renderTemplate('image-processed-successfully', 'html', {
      USER_NAME: 'Aman Kumar',
      JOB_ID: 'job-2b4c1e8',
    });
    const text2 = renderTemplate('image-processed-successfully', 'txt', {
      USER_NAME: 'Aman Kumar',
      JOB_ID: 'job-2b4c1e8',
    });

    await emailService.sendEmail(to, '✅ Image Processing Complete', html2, text2);
    logger.info('Successfully sent Image Processed email');

  } catch (error) {
    logger.error('Failed to send test emails:', error);
  }
};

run();
