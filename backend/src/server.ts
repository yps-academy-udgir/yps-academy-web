/**
 * Server Entry Point
 * Initializes database connection and starts the Express server
 * Follows industry-standard separation of concerns
 */

import dotenv from 'dotenv';
import { createApp } from './app';
import { connectDatabase } from './config/database.config';
import { seedAuthUsers } from './utils/seed-auth.util';
import logger from './utils/logger';

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 4026;
const NODE_ENV = process.env.NODE_ENV || 'development';

/**
 * Start the server
 */
const startServer = async (): Promise<void> => {
  try {
    // Connect to database
    await connectDatabase();

    // Seed default auth users (only inserts if not already present)
    await seedAuthUsers();

    // Create Express app
    const app = createApp();

    // Start listening
    app.listen(PORT, () => {
      logger.info('=================================');
      logger.info(`🚀 Server running on http://localhost:${PORT}`);
      logger.info(`📝 Environment: ${NODE_ENV}`);
      logger.info(`📚 API Documentation: http://localhost:${PORT}/api`);
      logger.info('=================================');
    });
  } catch (error) {
    logger.error('Failed to start server:', { error });
    process.exit(1);
  }
};

// Start the server
startServer();

process.on('uncaughtException', (err) => {
  logger.error('uncaughtException', { err });
  process.exit(1);
});
process.on('unhandledRejection', (reason) => {
  logger.error('unhandledRejection', { reason });
});

