import app from './app';
import { env } from './config';
import { logger } from './shared/logger';

const startServer = async () => {
  try {
    const server = app.listen(env.PORT, () => {
      logger.info(`🚀 Email Service API is running on port ${env.PORT} in ${env.NODE_ENV} mode`);
    });

    const gracefulShutdown = (signal: string) => {
      logger.info(`Received ${signal}, shutting down Email Service API server gracefully...`);
      server.close(() => {
        process.exit(0);
      });
    };

    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  } catch (error) {
    logger.error(error as Error, 'Failed to start server:');
    process.exit(1);
  }
};

startServer();
