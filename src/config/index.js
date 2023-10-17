import { EnvConfig } from './envConfig.js';
import { DBOptions } from './dbOptions.js';
import { DBConfig } from './dbConfig.js';
import { sequelize } from './dbConnection.js';

const Config = {
  DB: sequelize,
  DBConfig,
  DBOptions,
  EnvConfig,
};

export default Config;
