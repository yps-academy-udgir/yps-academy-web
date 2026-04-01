import { Router } from 'express';
import {
  getAllClassrooms, getClassroomById, createClassroom, updateClassroom, deleteClassroom,
  assignFaculty, removeFaculty, enrollStudent, removeStudent,
  getSchedule, updateSchedule, getClassroomStats,
} from './classroom.controller';
import { validateObjectId } from '../../middleware/validation.middleware';
import { verifyToken } from '../../middleware/auth.middleware';

const router = Router();

router.use(verifyToken);

router.get('/stats/overview', getClassroomStats);
router.get('/', getAllClassrooms);
router.get('/:id', validateObjectId, getClassroomById);
router.post('/', createClassroom);
router.put('/:id', validateObjectId, updateClassroom);
router.delete('/:id', validateObjectId, deleteClassroom);

router.post('/:id/faculty', validateObjectId, assignFaculty);
router.delete('/:id/faculty/:facultyId', validateObjectId, removeFaculty);

router.post('/:id/students', validateObjectId, enrollStudent);
router.delete('/:id/students/:studentId', validateObjectId, removeStudent);

router.get('/:id/schedule', validateObjectId, getSchedule);
router.put('/:id/schedule', validateObjectId, updateSchedule);

export default router;
