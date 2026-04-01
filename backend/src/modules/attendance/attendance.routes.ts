import { Router } from 'express';
import {
  bulkMarkAttendance, getAttendanceByClassroom,
  getStudentAttendance, getAttendanceSummary,
} from './attendance.controller';
import { verifyToken } from '../../middleware/auth.middleware';

const router = Router();

router.use(verifyToken);

router.post('/bulk', bulkMarkAttendance);
router.get('/summary', getAttendanceSummary);
router.get('/students/:id', getStudentAttendance);
router.get('/', getAttendanceByClassroom);

export default router;
