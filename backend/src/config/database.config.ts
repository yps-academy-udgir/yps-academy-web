/**
 * Database Configuration
 * MongoDB connection setup with error handling
 */

import mongoose from 'mongoose';

/**
 * Connect to MongoDB
 */
export const connectDatabase = async (): Promise<void> => {
  try {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/yps-academy';

    await mongoose.connect(MONGODB_URI);

    console.log('✓ MongoDB connected successfully');
    console.log(`✓ Database: ${mongoose.connection.name}`);

    // Connection event listeners
    mongoose.connection.on('error', (error) => {
      console.error('✗ MongoDB connection error:', error);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠ MongoDB disconnected');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('MongoDB connection closed through app termination');
      process.exit(0);
    });
  } catch (error) {
    console.error('✗ MongoDB connection failed:', error);
    process.exit(1);
  }
};

/**
 * Disconnect from MongoDB
 */
export const disconnectDatabase = async (): Promise<void> => {
  try {
    await mongoose.connection.close();
    console.log('✓ MongoDB disconnected');
  } catch (error) {
    console.error('✗ Error disconnecting from MongoDB:', error);
  }
};
