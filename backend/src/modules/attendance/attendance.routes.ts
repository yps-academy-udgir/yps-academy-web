import { Router } from 'express';
import {
  bulkMarkAttendance, getAttendanceByClassroom,
  getStudentAttendance, getAttendanceSummary,
} from './attendance.controller';
import { verifyToken, requireRoles } from '../../middleware/auth.middleware';

const router = Router();

router.use(verifyToken);

// Admin + Faculty write
router.post('/bulk', requireRoles('admin', 'faculty'), bulkMarkAttendance);

// All roles readable
router.get('/summary', requireRoles('admin', 'faculty'), getAttendanceSummary);
router.get('/students/:id', requireRoles('admin', 'faculty', 'student'), getStudentAttendance);
router.get('/', requireRoles('admin', 'faculty'), getAttendanceByClassroom);

export default router;

