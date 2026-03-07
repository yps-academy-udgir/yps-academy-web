import { Router } from 'express';
import {
  createExamResult,
  getExamResultsByStudent,
  getExamResultById,
  updateExamResult,
  deleteExamResult,
} from '../controllers/exam-result.controller';
import { validateObjectId } from '../middleware/validation.middleware';

const router = Router();

router.get('/',     getExamResultsByStudent);               // GET  /api/exam-results?studentId=xxx
router.get('/:id',  validateObjectId, getExamResultById);   // GET  /api/exam-results/:id
router.post('/',    createExamResult);                      // POST /api/exam-results
router.put('/:id',  validateObjectId, updateExamResult);    // PUT  /api/exam-results/:id
router.delete('/:id', validateObjectId, deleteExamResult);  // DEL  /api/exam-results/:id

export default router;
