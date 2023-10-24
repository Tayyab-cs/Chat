import express from 'express';
import { Server } from 'socket.io';
import { createServer } from 'http';
import {
  onConnection,
  onDisconnect,
  onGroupMessage,
  onMessage,
  onChannelMessage,
} from '../utils/helper/index.js';
import { Logger } from '../utils/logger.js';

const app = express();
const httpServer = createServer(app);

export default () => {
  const io = new Server(httpServer, { cors: { origin: '*' } });

  io.on('connection', (socket) => {
    Logger.info(`⚡ User Connected ⚡`);

    // Joining...
    socket.on('join', async (data) => {
      Logger.info('⚡ Join Socket Triggered');
      const dataObj = {
        socketId: socket.id,
        senderId: data.senderId,
        receiverId: data.receiverId,
      };
      const joinStatus = await onConnection(dataObj);
      socket.join(data.roomId);
      socket.emit('join-status', { online: joinStatus.isOnline });
    });

    // Typing...
    socket.on('typing', async (data) => {
      Logger.info('⚡ Typing Socket Triggered');
      if (data.typing == true) io.emit('typing-status', data);
    });

    // Messaging...
    socket.on('message', async (data) => {
      Logger.info('⚡ Message Socket Triggered');
      const roomID = await onMessage(data);
      console.log(roomID);
      if (roomID.length == 8) {
        // && online &&
        // socket.join(roomID);
        io.in(roomID).emit('message-status', data);
      }
    });

    // Other Message...
    socket.on('otherMessage', async (data) => {
      Logger.info('⚡ Message Socket Triggered');
    });

    // Group Messaging...
    socket.on('group-message', async (data) => {
      Logger.info('⚡ Group Message Socket Triggered');
      const roomID = await onGroupMessage(data);
      if (roomID.length == 8) {
        socket.join(roomID);
        io.to(roomID).emit('group-message-status', data);
      }
    });

    // Channel Messaging...
    socket.on('channel-message', async (data) => {
      Logger.info('⚡ Channel Message Socket Triggered');
      const roomID = await onChannelMessage(data);
      if (roomID.length == 8) {
        socket.join(roomID);
        io.to(roomID).emit('channel-message-status', data);
      }
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
      Logger.info('⚡Disconnect Socket Triggered');
      await onDisconnect(socket.id);
      Logger.info('⚡ User disconnected ⚡');
    });
  });

  httpServer.listen(8800);
};
