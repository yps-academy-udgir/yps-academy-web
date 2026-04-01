import { Router } from 'express';
import {
  getAllStudents, getStudentById, createStudent, updateStudent,
  deleteStudent, getStudentStats, addPayment, getFeesSummary, getFeeDefaulters,
} from './student.controller';
import { validateObjectId } from '../../middleware/validation.middleware';
import { verifyToken } from '../../middleware/auth.middleware';
import { upload } from '../../middleware/upload.middleware';

const router = Router();

router.use(verifyToken);

router.get('/stats/overview', getStudentStats);
router.get('/fees/summary', getFeesSummary);
router.get('/fees/defaulters', getFeeDefaulters);
router.get('/', getAllStudents);
router.get('/:id', validateObjectId, getStudentById);
router.post('/', upload.single('image'), createStudent);
router.put('/:id', validateObjectId, upload.single('image'), updateStudent);
router.delete('/:id', validateObjectId, deleteStudent);
router.post('/:id/payments', validateObjectId, addPayment);

export default router;
