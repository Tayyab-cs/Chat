import express from 'express';
import { Server } from 'socket.io';
import { createServer } from 'http';
import helper from '../utils/helper/index.js';
import { Logger } from '../utils/logger.js';

const app = express();
const httpServer = createServer(app);

export default () => {
  const io = new Server(httpServer, { cors: { origin: '*' } });

  io.on('connection', (socket) => {
    Logger.info(`⚡ User Connected`);
    socket.on('connection', async (data) => {
      const dataObj = {
        socketId: socket.id,
        senderId: data.senderId,
      };
      const connectionStatus = await helper.onConnection(dataObj);
      socket.emit('connection-status', connectionStatus);
    });
    socket.on('message', async (data) => {
      Logger.info(data);
      await helper.onMessage(data);
      socket.emit('message-status', data);
    });
    socket.on('disconnect', async () => {
      await helper.onDisconnect(socket.id);
      Logger.info('⚡ User disconnected.');
    });
  });

  httpServer.listen(8800);
};
