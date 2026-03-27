import expressWinston from 'express-winston';
import logger from '../utils/logger';

export const requestLogger = expressWinston.logger({
  winstonInstance: logger,
  msg: '{{req.method}} {{req.url}} {{res.statusCode}} {{res.responseTime}}ms',
  meta: true,
  expressFormat: false,
  colorize: process.env.NODE_ENV !== 'production',
  ignoreRoute: (req) => req.path.startsWith('/api/health'),
});
