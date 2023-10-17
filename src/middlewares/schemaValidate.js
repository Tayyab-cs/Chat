import Joi from 'joi';
import { Logger } from '../utils/logger.js';
import { errorObject } from '../utils/errorObject.js';

export const schemaValidate = (schemaObject) => (req, res, next) => {
  Logger.info('==> Validation Middleware...');

  try {
    const result = schemaObject.validate(req.body);
    if (result.error) {
      const err = result.error.details.reduce((acc, value) => {
        return value.message;
      }, 0);
      throw errorObject(err, 'unAuthorized');
    }
    next();
  } catch (error) {
    return next(error);
  }
};
