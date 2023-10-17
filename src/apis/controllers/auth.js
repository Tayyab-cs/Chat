import helper from '../../utils/helper/index.js';
import { Logger } from '../../utils/logger.js';
import {
  findByEmail,
  findUser,
  create,
  comparePassword,
} from '../services/index.js';

export const signUp = async (req, res, next) => {
  Logger.info('==> SignUp Controller...');

  const { firstName, lastName, userName, email, password, phoneNo } = req.body;
  try {
    await findByEmail(email);
    await create({ firstName, lastName, userName, email, password, phoneNo });

    const accessToken = helper.createToken(email, password);
    const refreshToken = helper.createToken(email, password);

    Logger.info('==> User SignUp Successfully');
    return res.status(201).json({
      success: true,
      message: '==> User SignUp Successfully',
      user: {
        firstName,
        lastName,
        userName,
        email,
        password,
        phoneNo,
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

    const accessToken = helper.createToken(email, password);
    const refreshToken = helper.createToken(email, password);

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
