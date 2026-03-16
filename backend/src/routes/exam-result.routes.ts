import { Router } from 'express';
import {
  createExamResult,
  getExamResultsByStudent,
  getExamResultById,
  updateExamResult,
  deleteExamResult,
  bulkSaveExamResults,
  getExamResultsByClassroom,
  getFilteredExamResults,
} from '../controllers/exam-result.controller';
import { validateObjectId } from '../middleware/validation.middleware';
import { verifyToken } from '../middleware/auth.middleware';

const router = Router();

// All exam-result routes require a valid JWT
router.use(verifyToken);

// Specific paths before /:id wildcard
router.post('/bulk',                    bulkSaveExamResults);                  // POST /api/exam-results/bulk
router.get('/classroom/:classroomId',   getExamResultsByClassroom);            // GET  /api/exam-results/classroom/:classroomId
router.get('/filter',                   getFilteredExamResults);               // GET  /api/exam-results/filter

router.get('/',     getExamResultsByStudent);               // GET  /api/exam-results?studentId=xxx
router.get('/:id',  validateObjectId, getExamResultById);   // GET  /api/exam-results/:id
router.post('/',    createExamResult);                      // POST /api/exam-results
router.put('/:id',  validateObjectId, updateExamResult);    // PUT  /api/exam-results/:id
router.delete('/:id', validateObjectId, deleteExamResult);  // DEL  /api/exam-results/:id

export default router;
