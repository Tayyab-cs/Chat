import express from 'express';
import {
  createGroup,
  joinGroup,
  createChannel,
  joinChannel,
} from '../controllers/index.js';
import { decryptToken } from '../../middlewares/general.js';

const route = express.Router();

// Group Routes...
route.post('/createGroup', createGroup);
route.post('/joinGroup', joinGroup);

// Channel Routes...
route.post('/createChannel', decryptToken, createChannel);
route.post('/joinChannel', decryptToken, joinChannel);

export default route;
