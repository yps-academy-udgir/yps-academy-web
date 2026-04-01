import { Router } from 'express';
import {
  getAllFaculty, getFacultyById, createFaculty, updateFaculty,
  deleteFaculty, addSalaryPayment, getFacultyStats,
} from './faculty.controller';
import { validateObjectId } from '../../middleware/validation.middleware';
import { verifyToken, requireRoles } from '../../middleware/auth.middleware';
import { upload } from '../../middleware/upload.middleware';

const router = Router();

router.use(verifyToken);

// Admin + Faculty readable
router.get('/stats/overview', requireRoles('admin', 'faculty'), getFacultyStats);
router.get('/', requireRoles('admin', 'faculty'), getAllFaculty);
router.get('/:id', validateObjectId, requireRoles('admin', 'faculty'), getFacultyById);

// Admin only
router.post('/', requireRoles('admin'), upload.single('image'), createFaculty);
router.put('/:id', validateObjectId, requireRoles('admin'), upload.single('image'), updateFaculty);
router.delete('/:id', validateObjectId, requireRoles('admin'), deleteFaculty);
router.post('/:id/payments', validateObjectId, requireRoles('admin'), addSalaryPayment);

export default router;

