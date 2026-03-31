/**
 * Student Routes
 * Defines all routes for student operations
 * Follows RESTful API conventions
 */

import { Router } from 'express';
import {
  getAllStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  getStudentStats,
  addPayment,
  getFeesSummary,
  getFeeDefaulters,
} from '../controllers/student.controller';
import { validateStudent, validateObjectId } from '../middleware/validation.middleware';
import { verifyToken } from '../middleware/auth.middleware';

const router = Router();

// All student routes require a valid JWT
router.use(verifyToken);

/**
 * @route   GET /api/students/stats/overview
 * @desc    Get student statistics (must be before /:id route)
 * @access  Public
 */
router.get('/stats/overview', getStudentStats);
router.get('/fees/summary', getFeesSummary);
router.get('/fees/defaulters', getFeeDefaulters);

/**
 * @route   GET /api/students
 * @desc    Get all students with pagination and filtering
 * @access  Public
 * @query   page, limit, gender, search
 */
router.get('/', getAllStudents);

/**
 * @route   GET /api/students/:id
 * @desc    Get single student by ID
 * @access  Public
 */
router.get('/:id', validateObjectId, getStudentById);

/**
 * @route   POST /api/students
 * @desc    Create new student
 * @access  Public
 */
import { upload } from '../middleware/upload.middleware';

router.post('/', upload.single('image'), validateStudent, createStudent);

/**
 * @route   PUT /api/students/:id
 * @desc    Update student
 * @access  Public
 */
router.put('/:id', upload.single('image'), validateObjectId, validateStudent, updateStudent);

/**
 * @route   DELETE /api/students/:id
 * @desc    Delete student
 * @access  Public
 */
router.delete('/:id', validateObjectId, deleteStudent);
router.post('/:id/payments', validateObjectId, addPayment);

export default router;
