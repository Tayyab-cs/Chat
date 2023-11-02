import dotenv from 'dotenv';

process.env.NODE_ENV = process.env.NODE_ENV || 'development';
const envFound = dotenv.config();

if (envFound.error) throw new Error('⚠  Env file not found!  ⚠');

export const EnvConfig = {
  port: parseInt(process.env.PORT, 10),
  dbName: process.env.DB_NAME,
  dbUser: process.env.DB_USER,
  dbHost: process.env.DB_HOST,
  dbPass: process.env.DB_PASS,
  dbDialect: process.env.DB_DIALECT,
  jwtSecret: process.env.JWT_SECRET,
  ip: process.env.IP,
  logs: {
    morgan: process.env.MORGAN,
  },
  api: {
    prefix: '/api',
  },
};
