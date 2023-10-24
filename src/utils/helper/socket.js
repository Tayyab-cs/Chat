import { Logger } from '../logger.js';
import { models } from '../../config/dbConnection.js';

export const onConnection = async (data) => {
  const { socketId, senderId, receiverId } = data;
  try {
    const user = await models.User.findOne({ where: { id: senderId } });
    if (!user) return Logger.error('Sender not Found!');
    const msg = await models.Message.update(
      { isRead: true },
      {
        where: { receiverId: user.id, senderId: receiverId, isRead: false },
      },
    );
    console.log(msg);
    return user.update({
      socketId,
      isOnline: true,
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

  // finding receiver for creating conversation with him...
  const receiver = await models.User.findOne({
    where: { id: receiverId },
    raw: true,
  });

  // Checking ONLINE/OFFLINE Status...
  if (receiver.isOnline == true) {
    const recCon = await models.Conversation.findOne({
      where: { id: receiverId },
    });

    if (recCon.dataValues.roomId == receiver.roomId) {
      await senderReceiver.update({ isRead: true });
    }
  } else {
    await senderReceiver.update({ isRead: false });
  }

  const conversationObj = {
    name: receiver.userName,
    isGroup: false,
    isChannel: false,
    roomId,
  };

  // Creating New Conversation...
  if (!senderReceiver) {
    const conversation = await models.Conversation.create(conversationObj);
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

    // saving message...
    await models.Message.create({
      senderId,
      receiverId,
      message,
      conversationId: conversation.id,
    });
    return conversation.roomId;
  }

  // Updating Existing Conversation...
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
      isOnline: false,
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

export const onChannelMessage = async (data) => {
  const { senderId, conversationId, message } = data;

  const con = await models.Conversation.findOne({
    where: { id: conversationId },
  });
  if (!con || !con.isChannel) return Logger.error('Channel not exists!');

  if (con.type === 'public') {
    await models.Message.create({
      senderId,
      conversationId,
      message,
    });
    return con.roomId;
  }

  if (con.type === 'private') {
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
  }

  return Logger.error('message not delivered!');
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
