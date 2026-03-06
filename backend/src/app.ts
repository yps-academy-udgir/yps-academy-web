/**
 * Express Application Setup
 * Configures middleware and routes
 * Separates app configuration from server initialization
 */

import express, { Express } from 'express';
import cors from 'cors';
import apiRoutes from './routes';
import { notFoundHandler, errorHandler } from './middleware/error.middleware';

/**
 * Create and configure Express application
 */
export const createApp = (): Express => {
  const app: Express = express();

  // CORS Configuration
  app.use(
    cors({
      origin: process.env.FRONTEND_URL || 'http://localhost:4200',
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );

  // Body parsing middleware
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Request logging middleware (development only)
  if (process.env.NODE_ENV === 'development') {
    app.use((req, res, next) => {
      console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
      next();
    });
  }

  // API Routes
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
