import { createToken } from './general.js';
import { onMessage, onConnection, onDisconnect } from './socket.js';

const helper = {
  createToken,
  onMessage,
  onConnection,
  onDisconnect,
};

export default helper;
