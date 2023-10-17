import express from 'express';
import authApis from './auth.js';

const router = express.Router();

router.use('/user', authApis);

export default router;
