import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import Config from '../../config/index.js';
import { Logger } from '../logger.js';
import { errorObject } from '../errorObject.js';

export const createToken = (email, password) => {
  Logger.info('==> Create JWT Token...');
  const payload = { email, password };
  const secretKey = Config.EnvConfig.jwtSecret;
  const expiresIn = '1h';
  const token = jwt.sign(payload, secretKey, {
    expiresIn,
  });
  return token;
};
