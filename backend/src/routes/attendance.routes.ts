import { Router } from 'express';
import {
  bulkMarkAttendance,
  getAttendanceByClassroom,
  getStudentAttendance,
  getAttendanceSummary,
} from '../controllers/attendance.controller';
import { verifyToken } from '../middleware/auth.middleware';

const router = Router();
router.use(verifyToken);

router.post('/bulk',        bulkMarkAttendance);       // POST /api/attendance/bulk
router.get('/summary',      getAttendanceSummary);     // GET  /api/attendance/summary?classroomId=
router.get('/students/:id', getStudentAttendance);     // GET  /api/attendance/students/:id
router.get('/',             getAttendanceByClassroom); // GET  /api/attendance?classroomId=&date=&subject=

export default router;
