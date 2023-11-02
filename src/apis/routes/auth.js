import express from 'express';
import {
  signUp,
  login,
  fetchUsers,
  setAvatar,
  validate,
} from '../controllers/index.js';
import { validateSignUp, validateLogin } from '../../validation/index.js';
import {
  schemaValidate,
  hashPassword,
  decryptToken,
} from '../../middlewares/index.js';

// eslint-disable-next-line new-cap
const route = express.Router();

route.post('/signup', schemaValidate(validateSignUp), hashPassword, signUp);
route.post('/login', schemaValidate(validateLogin), login);
route.get('/users', decryptToken, fetchUsers);
route.post('/setavatar', decryptToken, setAvatar);
route.get('/validate', validate);

export default route;
