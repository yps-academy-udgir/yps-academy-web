/**
 * Classroom Routes
 * Defines API endpoints for classroom management
 */

import { Router } from 'express';
import {
  getAllClassrooms,
  getClassroomById,
  createClassroom,
  updateClassroom,
  deleteClassroom,
  assignFaculty,
  removeFaculty,
  enrollStudent,
  removeStudent,
  updateSchedule,
  getSchedule,
  getClassroomStats,
} from '../controllers/classroom.controller';
import {
  validateObjectId,
  validateClassroom,
  validateFacultyAssignment,
  validateStudentEnrollment,
  validateScheduleUpdate,
} from '../middleware/validation.middleware';
import { verifyToken } from '../middleware/auth.middleware';

const router = Router();

// Apply JWT authentication to all classroom routes
router.use(verifyToken);

// Stats endpoint (must come before /:id)
router.get('/stats/overview', getClassroomStats);

// CRUD operations
router.get('/', getAllClassrooms);
router.get('/:id', validateObjectId, getClassroomById);
router.post('/', validateClassroom, createClassroom);
router.put('/:id', validateObjectId, validateClassroom, updateClassroom);
router.delete('/:id', validateObjectId, deleteClassroom);

// Faculty assignment
router.post('/:id/faculty', validateObjectId, validateFacultyAssignment, assignFaculty);
router.delete('/:id/faculty/:facultyId', validateObjectId, removeFaculty);

// Student enrollment
router.post('/:id/students', validateObjectId, validateStudentEnrollment, enrollStudent);
router.delete('/:id/students/:studentId', validateObjectId, removeStudent);

// Schedule management
router.get('/:id/schedule', validateObjectId, getSchedule);
router.put('/:id/schedule', validateObjectId, validateScheduleUpdate, updateSchedule);

export default router;
