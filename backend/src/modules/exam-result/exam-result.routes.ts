import { Router } from 'express';
import {
  createExamResult, getExamResultsByStudent, getExamResultById,
  updateExamResult, deleteExamResult, bulkSaveExamResults,
  getExamResultsByClassroom, getFilteredExamResults,
} from './exam-result.controller';
import { validateObjectId } from '../../middleware/validation.middleware';
import { verifyToken, requireRoles } from '../../middleware/auth.middleware';

const router = Router();

router.use(verifyToken);

// Admin + Faculty write
router.post('/bulk', requireRoles('admin', 'faculty'), bulkSaveExamResults);
router.post('/', requireRoles('admin', 'faculty'), createExamResult);
router.put('/:id', validateObjectId, requireRoles('admin', 'faculty'), updateExamResult);

// All roles readable
router.get('/classroom/:classroomId', requireRoles('admin', 'faculty', 'student'), getExamResultsByClassroom);
router.get('/filter', requireRoles('admin', 'faculty', 'student'), getFilteredExamResults);
router.get('/', requireRoles('admin', 'faculty', 'student'), getExamResultsByStudent);
router.get('/:id', validateObjectId, requireRoles('admin', 'faculty', 'student'), getExamResultById);

// Admin only
router.delete('/:id', validateObjectId, requireRoles('admin'), deleteExamResult);

export default router;

