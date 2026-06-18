import { logger } from './shared/logger';
import { emailWorker } from './features/email/email.worker';

const startWorker = async () => {
  try {
    logger.info('🚀 Email System Worker process started successfully');
  } catch (error) {
    logger.error(error as Error, 'Failed to start worker process:');
    process.exit(1);
  }
};

const gracefulShutdown = async (signal: string) => {
  logger.info(`Received ${signal}, closing email worker gracefully...`);
  await emailWorker.close();
  process.exit(0);
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

startWorker();
