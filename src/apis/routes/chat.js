import express from 'express';
import {
  dashboard,
  fetchChat,
  unreadChat,
  createGroup,
  joinGroup,
  getGroups,
  fetchGroupChat,
  updateAdmin,
  leaveGroup,
  createChannel,
  joinChannel,
  getChannels,
} from '../controllers/index.js';
import { decryptToken } from '../../middlewares/general.js';

const route = express.Router();

// Fetch Chat from DB...
route.get('/dashboard', decryptToken, dashboard);
route.get('/fetchChat/:conversationId', decryptToken, fetchChat);
route.get('/unreadChat/:receiverId', decryptToken, unreadChat);

// Group Routes...
route.post('/createGroup', decryptToken, createGroup);
route.post('/joinGroup', decryptToken, joinGroup);
route.get('/getGroups', decryptToken, getGroups);
route.get('/fetchGroupChat/:conversationId', decryptToken, fetchGroupChat);
route.patch('/updateAdmin', decryptToken, updateAdmin);
route.delete('/leaveGroup', decryptToken, leaveGroup);

// Channel Routes...
route.post('/createChannel', decryptToken, createChannel);
route.post('/joinChannel', decryptToken, joinChannel);
route.get('/getChannels', getChannels);

export default route;
