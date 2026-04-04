import { Router } from 'express';
import { academicYearController } from './academic-year.controller';
import { verifyToken, requireRoles } from '../../middleware/auth.middleware';

const router = Router();

router.use(verifyToken);
router.use(requireRoles('admin'));

router.get('/promotion-preview', academicYearController.getPromotionPreview);
router.post('/promote', academicYearController.promote);

export default router;
