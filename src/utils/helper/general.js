/* eslint-disable guard-for-in */
import jwt from 'jsonwebtoken';
import Config from '../../config/index.js';
import { Logger } from '../logger.js';

export const createToken = (id, email) => {
  Logger.info('==> Create JWT Token...');
  const payload = { id, email };
  const secretKey = Config.EnvConfig.jwtSecret;
  const expiresIn = '1h';
  const token = jwt.sign(payload, secretKey, {
    expiresIn,
  });
  return token;
};
