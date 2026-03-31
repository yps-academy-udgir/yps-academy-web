import { createLogger, format, transports } from 'winston';
import { TransformableInfo } from 'logform';
const { combine, timestamp, printf, errors, json, colorize } = format;

const LOG_LEVEL = process.env.LOG_LEVEL || 'info';
const isProd = process.env.NODE_ENV === 'production';

const consoleFormat = combine(
  timestamp(),
  errors({ stack: true }),
  isProd ? json() : colorize({ all: true }),
  printf((info: TransformableInfo) => {
    const { level, message, timestamp, stack, ...meta } = info;
    const base = `${timestamp} [${level}]: ${message}`;
    return stack ? `${base}\n${stack}` : `${base} ${Object.keys(meta).length ? JSON.stringify(meta) : ''}`;
  })
);

const logger = createLogger({
  level: LOG_LEVEL,
  format: combine(timestamp(), errors({ stack: true })),
  transports: [new transports.Console({ format: consoleFormat })],
  exitOnError: false,
});

export default logger;
export const stream = { write: (message: string) => logger.info(message.trim()) };
