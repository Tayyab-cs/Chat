import bcrypt from 'bcrypt';
import { Logger } from '../../utils/logger.js';
import { errorObject } from '../../utils/errorObject.js';
import { models } from '../../config/dbConnection.js';
import { createToken } from '../../utils/helper/general.js';
import jwt from 'jsonwebtoken';
import { Op } from 'sequelize';

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
  Logger.info('User Service');
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

export const fetchUserService = async (id) => {
  Logger.info('Fetch Chat Service');
  const users = await models.User.findAll({ where: { id: { [Op.not]: id } } });
  const user = users.map((data) => {
    return {
      id: data.id,
      username: data.userName,
      email: data.email,
      avatarImage: data.avatarImage,
      socketId: data.socketId,
    };
  });
  return user;
};

export const setAvatarService = async (userId, avatarImage) => {
  const user = await models.User.findOne({ where: { userId } });
  const updatedUser = await user.update(
      { isAvatarSet: true, avatarImage },
      { new: true },
  );
  return updatedUser;
};

export const validateToken = async (bearerToken) => {
  const token = bearerToken.split(' ')[1];
  const decodedToken = jwt.decode(token);
  const userData = await models.User.findOne({
    where: { email: decodedToken.email },
  });

  const user = {
    id: userData.id,
    userName: userData.userName,
    email: userData.email,
    avatarImage: userData.avatarImage,
  };

  if (!user) throw errorObject('user not exists', 'unAuthorized');
  const accessToken = createToken(user.id, user.email);
  return { user, accessToken };
};
