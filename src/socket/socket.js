import express from 'express';
import { Server } from 'socket.io';
import { createServer } from 'http';
import {
  onConnection,
  onDisconnect,
  onGroupMessage,
  onMessage,
} from '../utils/helper/index.js';
import { Logger } from '../utils/logger.js';

const app = express();
const httpServer = createServer(app);

export default () => {
  const io = new Server(httpServer, { cors: { origin: '*' } });

  io.on('connection', (socket) => {
    Logger.info(`⚡ User Connected`);

    socket.on('connection', async (data) => {
      Logger.info('Connection Socket Triggered');
      const dataObj = {
        socketId: socket.id,
        senderId: data.senderId,
      };
      const connectionStatus = await onConnection(dataObj);
      socket.emit('connection-status', connectionStatus);
    });
    socket.on('message', async (data) => {
      Logger.info('Message Socket Triggered');
      const roomID = await onMessage(data);
      socket.join(roomID);
      io.to(roomID).emit('message-status', data);
    });
    socket.on('group-message', async (data) => {
      Logger.info('Group Message Socket Triggered');
      const roomID = await onGroupMessage(data);
      socket.join(roomID);
      io.to(roomID).emit('message-status', data);
    });

    // socket.on('create-group', async (data) => {
    //   Logger.info('Group Socket Triggered');
    //   const groupRoomId = await onCreateGroup(data);
    //   socket.join(groupRoomId);
    //   io.to(groupRoomId).emit('group-created', 'Group Created Successfully.');
    // });
    // socket.on('join-group', async (data) => {
    //   Logger.info('Join Group Socket Triggered');
    //   const group = await onJoinGroup(data);
    //   console.log(group);
    // });
    socket.on('disconnect', async () => {
      Logger.info('Disconnect Socket Triggered');
      await onDisconnect(socket.id);
      Logger.info('⚡ User disconnected.');
    });
  });

  httpServer.listen(8800);
};
