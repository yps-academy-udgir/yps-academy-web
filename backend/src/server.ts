/**
 * Server Entry Point
 * Initializes database connection and starts the Express server with Socket.io
 * Follows industry-standard separation of concerns
 */

import dotenv from 'dotenv';
import http from 'http';
import { Server } from 'socket.io';
import { createApp } from './app';
import { connectDatabase } from './config/database.config';
import { initializeSocketHandlers } from './config/socket.config';
import { seedAuthUsers } from './utils/seed-auth.util';
import logger from './utils/logger';

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 4026;
const NODE_ENV = process.env.NODE_ENV || 'development';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:4025';

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

    // Create HTTP server
    const httpServer = http.createServer(app);

    // Initialize Socket.io
    const io = new Server(httpServer, {
      cors: {
        origin: FRONTEND_URL,
        credentials: true,
        methods: ['GET', 'POST'],
      },
      transports: ['websocket', 'polling'],
    });

    // Setup Socket.io event handlers
    initializeSocketHandlers(io);

    // Make io available to the app for future use
    (app as any).io = io;

    // Start listening
    httpServer.listen(PORT, () => {
      logger.info('=================================');
      logger.info(`🚀 Server running on http://localhost:${PORT}`);
      logger.info(`🔌 Socket.io enabled on ws://localhost:${PORT}`);
      logger.info(`📝 Environment: ${NODE_ENV}`);
      logger.info(`📚 API Documentation: http://localhost:${PORT}/api`);
      logger.info('=================================');
    });
  } catch (error) {
    logger.error('Failed to start server: ' + error);
    process.exit(1);
  }
};

// Start the server
startServer();

process.on('uncaughtException', (err) => {
  logger.error('uncaughtException: ' + err);
  process.exit(1);
});
process.on('unhandledRejection', (reason) => {
  logger.error('unhandledRejection: ' + reason);
});

