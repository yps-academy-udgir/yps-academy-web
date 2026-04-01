import { Router } from 'express';
import { login, verifyTokenController } from './auth.controller';
import { verifyToken } from '../../middleware/auth.middleware';

const router = Router();

router.post('/login', login);
router.get('/verify', verifyToken, verifyTokenController);

export default router;
