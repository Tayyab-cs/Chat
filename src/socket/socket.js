import express from 'express';
import { Server } from 'socket.io';
import { createServer } from 'http';
import {
  onOnline,
  joinConversation,
  onDisconnect,
  onGroupMessage,
  onMessage,
  onMessageDelivered,
  onMessageSeen,
  onChannelMessage,
} from '../utils/helper/index.js';
import { Logger } from '../utils/logger.js';

const app = express();
const httpServer = createServer(app);

export default () => {
  const io = new Server(httpServer, { cors: { origin: '*' } });

  io.on('connect', (socket) => {
    // Logger.info(`⚡ User Connected ⚡`);

    // Socket Connection...
    socket.on('online', async (data) => {
      Logger.info('⚡ Online Socket Triggered');
      console.log('online Data: ', data);
      const dataObj = {
        socketId: socket.id,
        senderId: data.senderId,
      };
      const onlineStatus = await onOnline(dataObj);
      socket.emit('online-status', onlineStatus);
    });

    // Join Conversation...
    socket.on('joinConversation', async (data) => {
      Logger.info('⚡ Join Conversation Socket Triggered');
      console.log('joinConversation Data: ', data);
      const conversation = await joinConversation(data);
      console.log('Join Data: ', data);
      socket.join(data.roomId);
      io.in(data.roomId).emit('conversation-status', conversation);

      // const recObj = {
      //   senderId: data.senderId,
      //   receiverId: data.userId,
      // };

      // const receivedMsg = await onReceived(recObj);
      // io.in(data.roomId).emit('received-status', receivedMsg);
    });

    // Messaging...
    socket.on('message', async (data) => {
      Logger.info('⚡ Message Socket Triggered');
      const messageData = await onMessage(data);
      io.to(messageData.roomId).emit('message-status', {
        senderId: messageData.senderId,
        receiverId: messageData.receiverId,
        message: messageData.message,
      });

      // New Unread Received Messages...
      // const receivedMsg = await onReceived(data);
      // io.emit('received-status', receivedMsg);
    });

    // Message Delivered status..
    socket.on('messageDelivered', async (data) => {
      Logger.info('⚡ messageDelievered Socket Triggered');
      const msgDelivered = await onMessageDelivered(data);
      socket.emit('delivered-status', msgDelivered);
    });

    // Message Seen status..
    socket.on('messageSeen', async (data) => {
      Logger.info('⚡ messageSeen Socket Triggered');
      const msgSeen = await onMessageSeen(data);
      socket.emit('seen-status', msgSeen);
    });

    // Group Messaging...
    socket.on('groupMessage', async (data) => {
      Logger.info('⚡ Group Message Socket Triggered');
      console.log('group chat data: ', data);
      const result = await onGroupMessage(data);
      io.to(result.roomId).emit('group-status', result);
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
