import { Router } from 'express';
import {
  getAllFaculty, getFacultyById, createFaculty, updateFaculty,
  deleteFaculty, addSalaryPayment, getFacultyStats,
} from './faculty.controller';
import { validateObjectId } from '../../middleware/validation.middleware';
import { verifyToken } from '../../middleware/auth.middleware';
import { upload } from '../../middleware/upload.middleware';

const router = Router();

router.use(verifyToken);

router.get('/stats/overview', getFacultyStats);
router.get('/', getAllFaculty);
router.get('/:id', validateObjectId, getFacultyById);
router.post('/', upload.single('image'), createFaculty);
router.put('/:id', validateObjectId, upload.single('image'), updateFaculty);
router.delete('/:id', validateObjectId, deleteFaculty);
router.post('/:id/payments', validateObjectId, addSalaryPayment);

export default router;
