import { Logger } from '../logger.js';
import { models } from '../../config/dbConnection.js';

export const onConnection = async (data) => {
  const { socketId, senderId } = data;
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

export const onMessage = async (data) => {
  const { senderId, receiverId, message } = data;
  const roomId = generateRoomID(8);

  const senderReceiver = await models.Message.findOne({
    where: { senderId, receiverId },
  });
  if (!senderReceiver) {
    const conversation = await models.Conversation.create({ roomId });
    const userCon = await models.UserConversation.bulkCreate([
      {
        userId: senderId,
        conversationId: conversation.id,
      },
      {
        userId: receiverId,
        conversationId: conversation.id,
      },
    ]);

    if (!conversation || !userCon)
      return Logger.error('Conversation not created!');
    await models.Message.create({
      senderId,
      receiverId,
      message,
      conversationId: conversation.id,
    });
    return conversation.roomId;
  }

  const conversation = await models.Conversation.findOne({
    where: { id: senderReceiver.conversationId },
  });

  // saving message...
  await models.Message.create({
    senderId,
    receiverId,
    message,
    conversationId: conversation.id,
  });
  return conversation.roomId;
};

export const onDisconnect = async (socketId) => {
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

export const onGroupMessage = async (data) => {
  const { senderId, conversationId, message } = data;

  const con = await models.Conversation.findOne({
    where: { id: conversationId },
  });
  if (!con || !con.isGroup) return Logger.error('Group not exists!');

  const userCon = await models.UserConversation.findOne({
    where: { userId: senderId, conversationId },
  });
  if (!userCon) return Logger.error('user not a member of group');

  await models.Message.create({
    senderId,
    conversationId,
    message,
  });
  return con.roomId;
};

// const onCreateGroup = async (data) => {
//   const { groupName, description, creatorId, participants } = data;
//   const roomId = generateRoomID(8);

//   const totalParticipants = participants.reduce((acc, cv) => {
//     return acc + 1;
//   }, 1);

//   // Creating Group Conversation...
//   const group = await models.Conversation.create({
//     name: groupName,
//     description,
//     isGroup: true,
//     roomId,
//     participants: totalParticipants,
//   });

//   // merging createdId with other added user Ids...
//   const userIDs = participants.map((participant) => participant.userId);
//   const mergedUserIds = [creatorId, ...userIDs];

//   // merging group Id with each userID
//   const resultArray = mergedUserIds.map((userId) => ({
//     userId: userId,
//     conversationId: group.id,
//   }));

//   // Creating userConversation Records...
//   const userCon = await models.UserConversation.bulkCreate(resultArray);

//   return group.roomId;
// };

// const onJoinGroup = async (data) => {
//   const { userId, conversationId } = data;

//   const group = await models.Conversation.findByPk(conversationId);
//   if (group.isGroup == false) return Logger.error('Group not exists.');
//   const user = await models.UserConversation.findOne({
//     where: { userId, conversationId },
//   });
//   if (user)
//     return Logger.info(`user with id ${userId} already joined the group.`);
//   const userCon = await models.UserConversation.create({
//     userId,
//     conversationId,
//   });
//   return userCon ? 'Joined Successfully' : 'Failed to Join';
// };

// Generating Random Room ID.
export const generateRoomID = (length) => {
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let roomID = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    roomID += characters[randomIndex];
  }
  return roomID;
};
