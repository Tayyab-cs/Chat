import express from 'express';
import {
  createGroup,
  joinGroup,
  createChannel,
  joinChannel,
  getGroups,
  getChannels,
  dashboard,
} from '../controllers/index.js';
import { decryptToken } from '../../middlewares/general.js';

const route = express.Router();

// Group Routes...
route.post('/createGroup', createGroup);
route.post('/joinGroup', joinGroup);
route.get('/getGroups', getGroups);

// Channel Routes...
route.post('/createChannel', decryptToken, createChannel);
route.post('/joinChannel', decryptToken, joinChannel);
route.get('/getChannels', getChannels);
route.get('/dashboard', decryptToken, dashboard);

export default route;
