/**
 * Faculty Routes
 * Defines all routes for faculty operations
 * Follows RESTful API conventions
 */

import { Router } from 'express';
import {
  getAllFaculty,
  getFacultyById,
  createFaculty,
  updateFaculty,
  deleteFaculty,
  addSalaryPayment,
  getFacultyStats,
} from '../controllers/faculty.controller';
import { validateFaculty, validateAddPayment, validateObjectId } from '../middleware/validation.middleware';
import { verifyToken } from '../middleware/auth.middleware';

const router = Router();

// All faculty routes require a valid JWT
router.use(verifyToken);

/**
 * @route   GET /api/faculty/stats/overview
 * @desc    Get faculty statistics — must be before /:id
 * @access  Public
 */
router.get('/stats/overview', getFacultyStats);

/**
 * @route   GET /api/faculty
 * @desc    Get all faculty with pagination and filtering
 * @access  Public
 * @query   page, limit, department, search
 */
router.get('/', getAllFaculty);

/**
 * @route   GET /api/faculty/:id
 * @desc    Get single faculty member by ID
 * @access  Public
 */
router.get('/:id', validateObjectId, getFacultyById);

/**
 * @route   POST /api/faculty
 * @desc    Create new faculty member
 * @access  Public
 */
router.post('/', validateFaculty, createFaculty);

/**
 * @route   PUT /api/faculty/:id
 * @desc    Update faculty member
 * @access  Public
 */
router.put('/:id', validateObjectId, validateFaculty, updateFaculty);

/**
 * @route   DELETE /api/faculty/:id
 * @desc    Delete faculty member
 * @access  Public
 */
router.delete('/:id', validateObjectId, deleteFaculty);

/**
 * @route   POST /api/faculty/:id/payments
 * @desc    Add a salary payment record
 * @access  Public
 */
router.post('/:id/payments', validateObjectId, validateAddPayment, addSalaryPayment);

export default router;
