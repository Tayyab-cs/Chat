import bcrypt from 'bcrypt';
import { Logger } from '../../utils/logger.js';
import { errorObject } from '../../utils/errorObject.js';
import { models } from '../../config/dbConnection.js';

export const findByEmail = async (email) => {
  Logger.info('==> User Service...');
  const user = await models.User.findOne({ where: { email } });
  if (user) throw errorObject('==> User Already Exists', 'duplication');
  return user;
};

export const create = async (userData) => {
  Logger.info('==> User Create Service...');
  const { userName, email, password } = userData;
  const result = await models.User.create({
    userName,
    email,
    password,
  });
  if (!result) throw errorObject('==> User not Created!');
  return result;
};

export const findUser = async (email) => {
  Logger.info('==> User Service');
  const user = await models.User.findOne({ where: { email } });
  if (!user) throw errorObject('User Not Found!', 'unAuthorized');
  return user;
};

export const comparePassword = async (pass, hashedPass) => {
  Logger.info('==> Compare Password Service');
  const result = await bcrypt.compare(pass, hashedPass);
  if (!result) throw errorObject('Invalid Password', 'unAuthorized');
  return result;
};
