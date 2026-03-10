import { Router } from 'express';
import { login, verifyToken as verifyTokenController } from '../controllers/auth.controller';
import { verifyToken } from '../middleware/auth.middleware';

const router = Router();

/**
 * @route  POST /api/auth/login
 * @desc   Login with userId, password and role
 * @access Public
 */
router.post('/login', login);

/**
 * @route  GET /api/auth/verify
 * @desc   Verify JWT token validity
 * @access Protected
 */
router.get('/verify', verifyToken, verifyTokenController);

export default router;
