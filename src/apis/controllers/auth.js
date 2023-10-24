import { createToken } from '../../utils/helper/index.js';
import { Logger } from '../../utils/logger.js';
import {
  findByEmail,
  findUser,
  create,
  comparePassword,
  getUserService,
  setAvatarService,
  validateToken,
} from '../services/index.js';

export const signUp = async (req, res, next) => {
  Logger.info('==> SignUp Controller...');

  const { userName, email, password } = req.body;
  console.log(userName, email, password);
  try {
    await findByEmail(email);
    const user = await create({ userName, email, password });
    console.log(user);
    console.log(user.avatarImage);

    const accessToken = createToken(user.id, user.email);

    Logger.info('User SignUp Successfully');
    return res.status(201).json({
      success: true,
      message: 'User SignUp Successfully',
      result: {
        user: {
          id: user.id,
          username: user.userName,
          email: user.email,
          avatarImage: user.avatarImage,
        },
        accessToken,
      },
    });
  } catch (error) {
    return next(error);
  }
};

export const login = async (req, res, next) => {
  Logger.info('==> User Login Controller');

  const { email, password } = req.body;
  try {
    const user = await findUser(email);
    console.log(user);
    await comparePassword(password, user.password);

    const accessToken = createToken(user.id, email);

    Logger.info('User login Successfully...');
    return res.status(201).json({
      success: true,
      message: 'User login Successfully...',
      result: {
        user: {
          userName: user.userName,
          id: user.id,
          email: user.email,
          avatarImage: user.avatarImage,
        },
        accessToken,
      },
    });
  } catch (error) {
    return next(error);
  }
};

export const allUsers = async (req, res, next) => {
  Logger.info('==> Get all users Controller');
  try {
    const users = await getUserService();
    Logger.info('users fetched successfully...');
    return res.status(201).json({
      success: true,
      message: 'users fetched successfully...',
      result: users,
    });
  } catch (error) {
    return next(error);
  }
};

export const setAvatar = async (req, res, next) => {
  Logger.info('Set Avatar Controller');

  const { userId } = req.user;
  const { avatarImage } = req.body.image;
  try {
    const avatar = await setAvatarService(userId, avatarImage);
    Logger.info('Avatar set successfully...');
    return res.status(201).json({
      success: true,
      message: 'Avatar set successfully...',
      result: avatar,
    });
  } catch (error) {
    return next(error);
  }
};

export const validate = async (req, res, next) => {
  Logger.info('Validation Controller');
  const bearerToken = req.headers['authorization'];
  try {
    const result = await validateToken(bearerToken);
    Logger.info('Access Token Created Successfully...');
    return res.status(201).json({
      success: true,
      message: 'user data and access token',
      result,
    });
  } catch (error) {
    return next(error);
  }
};
