import { Logger } from '../logger.js';
import { models } from '../../config/dbConnection.js';

const onMessage = async (data) => {
  const { senderId, receiverId, message } = data;
  const roomId = generateRoomID(8);
  console.log(roomId);
  const chat = await models.Conversation.create({ roomId });
  if (!chat) return console.log('Conversation not created!');
  await models.Message.create({ senderId, receiverId, message });
};

const onConnection = async (dataObj) => {
  const { socketId, senderId } = dataObj;
  try {
    const user = await models.User.findOne({ where: { id: senderId } });
    if (!user) return Logger.error('Sender not Found!');
    return user.update({
      socketId,
    });
  } catch (error) {
    return Logger.error(error);
  }
};

const onDisconnect = async (socketId) => {
  try {
    const user = await models.User.findOne({ where: { socketId } });
    if (!user) return Logger.info('User Offline');
    return user.update({
      socketId: null,
    });
  } catch (error) {
    return Logger.error(error);
  }
};

// Generating Random Room ID.
const generateRoomID = async (length) => {
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let roomID = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    roomID += characters[randomIndex];
  }
  return roomID;
};

export { onMessage, onConnection, onDisconnect, generateRoomID };
