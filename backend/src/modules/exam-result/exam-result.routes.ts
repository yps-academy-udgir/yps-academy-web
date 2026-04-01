import { Router } from 'express';
import {
  createExamResult, getExamResultsByStudent, getExamResultById,
  updateExamResult, deleteExamResult, bulkSaveExamResults,
  getExamResultsByClassroom, getFilteredExamResults,
} from './exam-result.controller';
import { validateObjectId } from '../../middleware/validation.middleware';
import { verifyToken } from '../../middleware/auth.middleware';

const router = Router();

router.use(verifyToken);

router.post('/bulk', bulkSaveExamResults);
router.get('/classroom/:classroomId', getExamResultsByClassroom);
router.get('/filter', getFilteredExamResults);
router.get('/', getExamResultsByStudent);
router.get('/:id', validateObjectId, getExamResultById);
router.post('/', createExamResult);
router.put('/:id', validateObjectId, updateExamResult);
router.delete('/:id', validateObjectId, deleteExamResult);

export default router;
