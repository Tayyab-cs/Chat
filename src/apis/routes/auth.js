import express from 'express';
import {
  signUp,
  login,
  allUsers,
  setAvatar,
  validate,
} from '../controllers/index.js';
import { validateSignUp, validateLogin } from '../../validation/index.js';
import {
  schemaValidate,
  hashPassword,
  decryptToken,
} from '../../middlewares/index.js';

const route = express.Router();

route.post('/signup', schemaValidate(validateSignUp), hashPassword, signUp);
route.post('/login', schemaValidate(validateLogin), login);
route.get('/allusers', allUsers);
route.post('/setavatar', decryptToken, setAvatar);
route.get('/validate', validate);

export default route;
