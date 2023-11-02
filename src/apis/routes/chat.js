import express from 'express';
import {
  dashboard,
  fetchChat,
  unreadChat,
  createGroup,
  joinGroupLink,
  joinGroup,
  fetchInviteLink,
  getGroups,
  fetchGroupChat,
  updateAdmin,
  leaveGroup,
  createChannel,
  joinChannel,
  getChannels,
} from '../controllers/index.js';
import { decryptToken } from '../../middlewares/general.js';

// eslint-disable-next-line new-cap
const route = express.Router();

// Fetch Chat from DB...
route.get('/dashboard', decryptToken, dashboard);
route.get('/fetchChat/:conversationId', decryptToken, fetchChat);
route.get('/unreadChat/:receiverId', decryptToken, unreadChat);

// Group Routes...
route.post('/createGroup', decryptToken, createGroup);
route.post('/joinGroup/:code', decryptToken, joinGroupLink);
route.post('/joinGroup', decryptToken, joinGroup);
route.get('/fetchInviteLink/:conversationId', decryptToken, fetchInviteLink);
route.get('/getGroups', decryptToken, getGroups);
route.get('/fetchGroupChat/:conversationId', decryptToken, fetchGroupChat);
route.patch('/updateAdmin', decryptToken, updateAdmin);
route.patch('/leaveGroup', decryptToken, leaveGroup);

// Channel Routes...
route.post('/createChannel', decryptToken, createChannel);
route.post('/joinChannel', decryptToken, joinChannel);
route.get('/getChannels', getChannels);

export default route;
