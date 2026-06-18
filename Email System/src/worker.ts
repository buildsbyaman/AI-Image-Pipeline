import { logger } from './shared/utils/logger';
import './modules/email/email.worker';

const startWorker = async () => {
  try {
    logger.info('🚀 Email System Worker process started successfully');
  } catch (error) {
    logger.error('Failed to start worker process:', error);
    process.exit(1);
  }
};

startWorker();
