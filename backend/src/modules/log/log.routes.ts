import { Router } from 'express';
import { postClientLog } from './log.controller';

const router = Router();

router.post('/logs/client', postClientLog);

export default router;
