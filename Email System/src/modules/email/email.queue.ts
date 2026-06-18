import { env } from '../../config/env';

export const connection = {
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
};
