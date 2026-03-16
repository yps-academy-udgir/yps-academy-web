import { Router } from 'express';
import studentRoutes from './student.routes';
import examResultRoutes from './exam-result.routes';
import facultyRoutes from './faculty.routes';
import classroomRoutes from './classroom.routes';
import authRoutes from './auth.routes';

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
router.use('/auth', authRoutes);
router.use('/students', studentRoutes);
router.use('/exam-results', examResultRoutes);
router.use('/faculty', facultyRoutes);
router.use('/classrooms', classroomRoutes);

export default router;
