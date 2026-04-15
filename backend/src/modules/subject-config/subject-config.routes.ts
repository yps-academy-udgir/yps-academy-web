import { Router } from 'express';
import { getSubjectConfig, updateSubjectConfig } from './subject-config.controller';
import { verifyToken, requireRoles } from '../../middleware/auth.middleware';

const router = Router();

router.use(verifyToken);

// All authenticated users can read the config (needed in student form + fee display)
router.get('/', requireRoles('admin', 'faculty', 'student'), getSubjectConfig);

// Only admin can update
router.put('/', requireRoles('admin'), updateSubjectConfig);

export default router;
