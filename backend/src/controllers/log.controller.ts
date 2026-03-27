import { Request, Response } from 'express';
import logger from '../utils/logger';

export const postClientLog = (req: Request, res: Response) => {
  const { level = 'error', message = '', meta = {} } = req.body || {};
  logger.log({ level, message: `[client] ${message}`, meta: { ...meta, ip: req.ip } });
  res.status(204).send();
};
