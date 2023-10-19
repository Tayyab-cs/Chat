import { createToken } from '../../utils/helper/index.js';
import { Logger } from '../../utils/logger.js';
import {
  findByEmail,
  findUser,
  create,
  comparePassword,
} from '../services/index.js';

export const signUp = async (req, res, next) => {
  Logger.info('==> SignUp Controller...');

  const { userName, email, password } = req.body;
  try {
    await findByEmail(email);
    await create({ userName, email, password });

    const accessToken = createToken(email, password);
    const refreshToken = createToken(email, password);

    Logger.info('==> User SignUp Successfully');
    return res.status(201).json({
      success: true,
      message: '==> User SignUp Successfully',
      user: {
        userName,
        email,
        password,
      },
      accessToken,
      refreshToken,
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
    await comparePassword(password, user.password);

    const accessToken = createToken(email, password);
    const refreshToken = createToken(email, password);

    Logger.info('==> User login Successfully...');
    return res.status(201).json({
      success: true,
      message: '==> User login Successfully...',
      accessToken,
      refreshToken,
    });
  } catch (error) {
    return next(error);
  }
};
