import express from 'express';
import { signUp, login } from '../controllers/index.js';
import { validateSignUp, validateLogin } from '../../validation/index.js';
import { schemaValidate, hashPassword } from '../../middlewares/index.js';

const route = express.Router();

route.post('/signUp', schemaValidate(validateSignUp), hashPassword, signUp);
route.post('/login', schemaValidate(validateLogin), login);

export default route;
