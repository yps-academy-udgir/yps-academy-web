import { Router } from 'express';
import { login, verifyTokenController, changePassword, resetPassword } from './auth.controller';
import { verifyToken, requireRoles } from '../../middleware/auth.middleware';

const router = Router();

router.post('/login', login);
router.get('/verify', verifyToken, verifyTokenController);
router.post('/change-password', verifyToken, changePassword);
router.post('/reset-password', verifyToken, requireRoles('admin'), resetPassword);

export default router;
