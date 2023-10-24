import joi from 'joi';

//==> validate signUp object keys
export const validateSignUp = joi.object().keys({
  userName: joi.string().required(),
  email: joi.string().email().required(),
  password: joi.string().min(4).max(10).required(),
});

//==> validate login object keys
export const validateLogin = joi.object({
  email: joi.string().email().required(),
  password: joi.string().min(4).max(10).required(),
});
