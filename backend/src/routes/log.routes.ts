import { Router } from 'express';
import { postClientLog } from '../controllers/log.controller';

const router = Router();
router.post('/logs', postClientLog);
export default router;
