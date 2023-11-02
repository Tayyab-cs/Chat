import { EnvConfig } from './envConfig.js';

const { dbName, dbUser, dbHost, dbDialect } = EnvConfig;

export const DBConfig = {
  development: {
    username: dbUser,
    password: null,
    database: dbName,
    host: dbHost,
    dialect: dbDialect,
  },
  test: {
    username: dbUser,
    password: null,
    database: dbName,
    host: dbHost,
    dialect: dbDialect,
  },
  production: {
    username: dbUser,
    password: null,
    database: dbName,
    host: dbHost,
    dialect: dbDialect,
  },
};
