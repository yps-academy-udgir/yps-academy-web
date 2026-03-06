/**
 * Routes Index
 * Central routing configuration
 * All route modules are registered here
 */

import { Router } from 'express';
import studentRoutes from './student.routes';

const router = Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is running',
    timestamp: new Date(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// Register route modules
router.use('/students', studentRoutes);

// Future routes will be added here
// router.use('/auth', authRoutes);
// router.use('/courses', courseRoutes);
// router.use('/teachers', teacherRoutes);

export default router;
