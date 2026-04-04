import { Router } from 'express';
import {
  getAllStudents, getStudentById, createStudent, updateStudent,
  deleteStudent, getStudentStats, addPayment, getFeesSummary, getFeeDefaulters, getMe,
  updateStudentStatus,
} from './student.controller';
import { validateObjectId } from '../../middleware/validation.middleware';
import { verifyToken, requireRoles } from '../../middleware/auth.middleware';
import { upload } from '../../middleware/upload.middleware';

const router = Router();

router.use(verifyToken);

// Student self-view (student role only)
router.get('/me', requireRoles('student'), getMe);

// Admin + Faculty readable
router.get('/stats/overview', requireRoles('admin', 'faculty'), getStudentStats);
router.get('/fees/summary', requireRoles('admin'), getFeesSummary);
router.get('/fees/defaulters', requireRoles('admin'), getFeeDefaulters);
router.get('/', requireRoles('admin', 'faculty'), getAllStudents);
router.get('/:id', validateObjectId, requireRoles('admin', 'faculty'), getStudentById);

// Admin + Faculty write
router.post('/', requireRoles('admin', 'faculty'), upload.single('image'), createStudent);
router.put('/:id', validateObjectId, requireRoles('admin', 'faculty'), upload.single('image'), updateStudent);

// Admin only
router.delete('/:id', validateObjectId, requireRoles('admin'), deleteStudent);
router.post('/:id/payments', validateObjectId, requireRoles('admin'), addPayment);
router.patch('/:id/status', validateObjectId, requireRoles('admin'), updateStudentStatus);

export default router;

