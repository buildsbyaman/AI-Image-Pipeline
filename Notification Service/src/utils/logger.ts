import winston from 'winston';
import { env } from '../config/env';

const { combine, timestamp, printf, colorize } = winston.format;

const myFormat = printf(({ level, message, timestamp, ...metadata }) => {
  let msg = `${timestamp} [${level}] : ${message} `;
  if (Object.keys(metadata).length > 0) {
    msg += JSON.stringify(metadata);
  }
  return msg;
});

export const logger = winston.createLogger({
  level: env.NODE_ENV === 'development' ? 'debug' : 'info',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    env.NODE_ENV === 'development' ? colorize() : winston.format.uncolorize(),
    myFormat
  ),
  transports: [
    new winston.transports.Console()
  ],
});
