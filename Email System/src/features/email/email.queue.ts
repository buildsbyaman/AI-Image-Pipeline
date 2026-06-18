import { env } from '../../config';

export const connection = {
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
};
