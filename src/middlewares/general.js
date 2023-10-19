import bcrypt from 'bcrypt';
import { Logger } from '../utils/logger.js';
import jwt from 'jsonwebtoken';

export const hashPassword = (req, res, next) => {
  const { password } = req.body;
  bcrypt.hash(password, 10, (err, hashPass) => {
    if (err) throw errorObject('==> Password Hashing Failed!');
    req.body.password = hashPass;
    next();
  });
};

export const decryptToken = (req, res, next) => {
  Logger.info('Decrypt Token Middleware Triggered');
  try {
    const bearerToken = req.headers['authorization'];
    if (!bearerToken) throw new Error('No Bearer Token Found!');
    const token = bearerToken.split(' ')[1];
    const decodedToken = jwt.decode(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    Logger.error('Token not decoded properly...');
    return next(error);
  }
};
