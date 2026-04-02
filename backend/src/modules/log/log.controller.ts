import { Request, Response } from 'express';
import logger from '../../utils/logger';

export const postClientLog = (req: Request, res: Response): void => {
  if (process.env.LOG_CLIENT_LOGS !== 'true') {
    res.status(204).send();
    return;
  }

  const { level = 'error', message = '', meta = {} } = req.body || {};
  const normalizedLevel = String(level).toLowerCase();
  const shouldLogInfo = process.env.LOG_CLIENT_INFO === 'true';

  if ((normalizedLevel === 'info' || normalizedLevel === 'log') && !shouldLogInfo) {
    res.status(204).send();
    return;
  }

  logger.log({ level, message: `[client] ${message}`, meta: { ...meta, ip: req.ip } });
  res.status(204).send();
};
