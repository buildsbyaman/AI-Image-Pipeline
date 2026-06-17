import { logger } from './utils/logger';
import './workers/notificationWorker'; // Import to initialize

const startWorker = () => {
  try {
    logger.info('🚀 Notification Worker process started successfully');
  } catch (error) {
    logger.error('Failed to start worker process:', error);
    process.exit(1);
  }
};

startWorker();
