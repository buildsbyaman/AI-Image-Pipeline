import app from './app';
import { env } from './config/env';
import { logger } from './utils/logger';

const startServer = () => {
  try {
    app.listen(env.PORT, () => {
      logger.info(`🚀 Notification Service API is running on port ${env.PORT} in ${env.NODE_ENV} mode`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
