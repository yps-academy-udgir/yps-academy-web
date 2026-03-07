/**
 * Server Entry Point
 * Initializes database connection and starts the Express server
 * Follows industry-standard separation of concerns
 */

import dotenv from 'dotenv';
import { createApp } from './app';
import { connectDatabase } from './config/database.config';

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

    // Create Express app
    const app = createApp();

    // Start listening
    app.listen(PORT, () => {
      console.log('=================================');
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📝 Environment: ${NODE_ENV}`);
      console.log(`📚 API Documentation: http://localhost:${PORT}/api`);
      console.log('=================================');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();

