import { Router } from 'express';
import {
  getAllClassrooms, getClassroomById, createClassroom, updateClassroom, deleteClassroom,
  assignFaculty, removeFaculty, enrollStudent, removeStudent,
  getSchedule, updateSchedule, getClassroomStats,
} from './classroom.controller';
import { validateObjectId } from '../../middleware/validation.middleware';
import { verifyToken, requireRoles } from '../../middleware/auth.middleware';

const router = Router();

router.use(verifyToken);

// All roles readable
router.get('/stats/overview', requireRoles('admin', 'faculty'), getClassroomStats);
router.get('/', requireRoles('admin', 'faculty', 'student'), getAllClassrooms);
router.get('/:id', validateObjectId, requireRoles('admin', 'faculty', 'student'), getClassroomById);
router.get('/:id/schedule', validateObjectId, requireRoles('admin', 'faculty', 'student'), getSchedule);

// Admin + Faculty write
router.post('/', requireRoles('admin', 'faculty'), createClassroom);
router.put('/:id', validateObjectId, requireRoles('admin', 'faculty'), updateClassroom);
router.put('/:id/schedule', validateObjectId, requireRoles('admin', 'faculty'), updateSchedule);
router.post('/:id/students', validateObjectId, requireRoles('admin', 'faculty'), enrollStudent);
router.delete('/:id/students/:studentId', validateObjectId, requireRoles('admin', 'faculty'), removeStudent);

// Admin only
router.delete('/:id', validateObjectId, requireRoles('admin'), deleteClassroom);
router.post('/:id/faculty', validateObjectId, requireRoles('admin'), assignFaculty);
router.delete('/:id/faculty/:facultyId', validateObjectId, requireRoles('admin'), removeFaculty);

export default router;

