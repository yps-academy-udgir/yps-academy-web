import { Router } from 'express';
import studentRoutes from '../modules/student/student.routes';
import examResultRoutes from '../modules/exam-result/exam-result.routes';
import facultyRoutes from '../modules/faculty/faculty.routes';
import classroomRoutes from '../modules/classroom/classroom.routes';
import attendanceRoutes from '../modules/attendance/attendance.routes';
import authRoutes from '../modules/auth/auth.routes';
import chatRoutes from '../modules/chat/chat.routes';

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
router.use('/classrooms', chatRoutes);  // Chat routes nested under /classrooms
router.use('/messages', chatRoutes);    // Message-level operations
router.use('/attendance', attendanceRoutes);

export default router;
