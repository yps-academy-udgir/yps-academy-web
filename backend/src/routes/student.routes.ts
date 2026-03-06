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
} from '../controllers/student.controller';
import { validateStudent, validateObjectId } from '../middleware/validation.middleware';

const router = Router();

/**
 * @route   GET /api/students/stats/overview
 * @desc    Get student statistics (must be before /:id route)
 * @access  Public
 */
router.get('/stats/overview', getStudentStats);

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
router.post('/', validateStudent, createStudent);

/**
 * @route   PUT /api/students/:id
 * @desc    Update student
 * @access  Public
 */
router.put('/:id', validateObjectId, validateStudent, updateStudent);

/**
 * @route   DELETE /api/students/:id
 * @desc    Delete student
 * @access  Public
 */
router.delete('/:id', validateObjectId, deleteStudent);

export default router;
