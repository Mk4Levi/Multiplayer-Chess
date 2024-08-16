export const MONGO_IP = process.env.MONGO_IP || 'mongo';
export const MONGO_PORT = process.env.MONGO_PORT || 27017;
export const MONGO_USER = process.env.MONGO_USER;
export const MONGO_PASSWORD = process.env.MONGO_PASSWORD;
export const REDIS_USERNAME = process.env.REDIS_USERNAME || 'default';
export const REDIS_PASSWORD = process.env.REDIS_PASSWORD || '';
export const REDIS_HOST = process.env.REDIS_HOST || 'redis';
export const REDIS_PORT = process.env.REDIS_PORT || 6379;
export const SESSION_SECRET = process.env.SESSION_SECRET || 'dev';
export const ALLOWED_ORIGIN =
  process.env.ALLOWED_ORIGIN || 'http://localhost:8080';
export const NODE_ENV = process.env.NODE_ENV || 'development';
