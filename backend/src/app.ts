/**
 * Express Application Setup
 * Configures middleware and routes
 * Separates app configuration from server initialization
 */

import express, { Express } from 'express';
import path from 'path';
import cors from 'cors';
import apiRoutes from './routes';
import { notFoundHandler, errorHandler } from './middleware/error.middleware';
import { requestLogger } from './middleware/request-logger.middleware';
import logRoutes from './routes/log.routes';

/**
 * Create and configure Express application
 */
export const createApp = (): Express => {
  const app: Express = express();

  // CORS Configuration
  app.use(
    cors({
      origin: process.env.FRONTEND_URL || 'http://localhost:4025',
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-Requested-With',
        'X-App-Version',
        'X-Timestamp',
      ],
      exposedHeaders: ['Authorization'],
    })
  );


  // Body parsing middleware
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Serve uploaded images statically
  app.use('/uploads', express.static(path.join(__dirname, '../../uploads')));

  // Request logging middleware (development or enabled via LOG_REQUESTS)
  if (process.env.NODE_ENV === 'development' || process.env.LOG_REQUESTS === 'true') {
    app.use(requestLogger as any);
  }

  // API Routes
  app.use('/api', logRoutes);
  app.use('/api', apiRoutes);

  // Root endpoint
  app.get('/', (req, res) => {
    res.json({
      success: true,
      message: 'YPS Academy API',
      version: '1.0.0',
      endpoints: {
        health: '/api/health',
        students: '/api/students',
        statistics: '/api/students/stats/overview',
      },
    });
  });

  // Error handling middleware (must be last)
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
