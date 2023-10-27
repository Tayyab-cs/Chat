import express from 'express';
import { Server } from 'socket.io';
import { createServer } from 'http';
import {
  onConnection,
  joinConversation,
  onReceived,
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

  io.on('connect', (socket) => {
    Logger.info(`⚡ User Connected ⚡`);

    // Socket Connection...
    socket.on('connection', async (data) => {
      Logger.info('⚡ Connection Socket Triggered');
      const dataObj = {
        socketId: socket.id,
        senderId: data.senderId,
      };
      const joinStatus = await onConnection(dataObj);
      socket.emit('join-status', joinStatus);
    });

    // Join Conversation...
    socket.on('joinConversation', async (data) => {
      Logger.info('⚡ Join Conversation Socket Triggered');
      const conversation = await joinConversation(data);
      socket.join(data.roomId);
      io.in(data.roomId).emit('conversation-status', conversation);

      const recObj = {
        senderId: data.senderId,
        receiverId: data.userId,
      };

      const receivedMsg = await onReceived(recObj);
      io.in(data.roomId).emit('received-status', receivedMsg);
    });

    // Typing...
    socket.on('typing', async (data) => {
      Logger.info('⚡ Typing Socket Triggered');
      if (data.typing == true) io.emit('typing-status', data);
    });

    // Messaging...
    socket.on('message', async (data) => {
      Logger.info('⚡ Message Socket Triggered');
      const roomId = await onMessage(data);
      console.log('Room Id:', roomId);
      io.in(roomId).emit('message-status', data);

      // New Unread Received Messages...
      // const receivedMsg = await onReceived(data);
      // io.emit('received-status', receivedMsg);
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

    socket.on('disconnect', async () => {
      Logger.info('⚡Disconnect Socket Triggered');
      await onDisconnect(socket.id);
      Logger.info('⚡ User disconnected ⚡');
    });
  });

  httpServer.listen(8800);
};
