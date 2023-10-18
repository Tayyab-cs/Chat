import express from 'express';
import authApis from './auth.js';
import chatApis from './chat.js';

const router = express.Router();

router.use('/user', authApis);
router.use('/chat', chatApis);

export default router;
