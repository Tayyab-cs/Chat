import { Logger } from '../logger.js';
import { models } from '../../config/dbConnection.js';
import { sequelize } from '../../config/dbConnection.js';
import { Op } from 'sequelize';

export const onConnection = async (data) => {
  const { socketId, senderId } = data;
  try {
    const t = await sequelize.transaction();

    // find user...
    const user = await models.User.update(
      { socketId, isOnline: true },
      { where: { id: senderId } },
      { transaction: t },
    );
    if (!user) return Logger.error('Sender not Found!');

    // const { count, rows } = await models.Message.findAndCountAll(
    //   {
    //     where: { receiverId: senderId, isRead: false },
    //     order: [['createdAt', 'DESC']],
    //   },
    //   { transaction: t },
    // );

    await t.commit();

    return {
      totalUnreadMsgs: count,
      unReadMsgs: rows,
    };
  } catch (error) {
    await t.rollback();
    return Logger.error(error);
  }
};

export const joinConversation = async (data) => {
  Logger.info('JoinConversation Socket Method');
  const { userId, roomId } = data;
  const t = await sequelize.transaction();

  try {
    // finding conversation...
    const conversation = await models.Conversation.findOne(
      {
        where: { roomId },
      },
      { transaction: t },
    );
    if (!conversation) return Logger.error('Conversation not Exists!');

    // finding all unread messages...
    const msgs = await models.Message.findAll({
      where: { receiverId: userId },
    });
    await models.Message.update(
      { isRead: true },
      {
        where: {
          receiverId: userId,
          conversationId: conversation.id,
          isRead: false,
        },
      },
      { transaction: t },
    );

    await t.commit();

    return {
      conversationId: conversation.id,
      conversationName: conversation.name,
      message: 'All messages are readed successfully',
      data: msgs,
    };
  } catch (error) {
    await t.rollback();
  }
};

export const onMessage = async (data) => {
  const { senderId, conversationId, message } = data;
  const roomId = generateRoomID(8);

  // Verify User...
  const sender = await models.User.findOne({
    where: { id: senderId },
    raw: true,
  });
  if (!sender) return Logger.error('sender not exists!');

  // Verify Conversation...
  const [conversation, created] = await models.Conversation.findOrCreate({
    where: { id: conversationId },
    raw: true,
  });

  const receiverId = await models.UserConversation.findOne({
    where: {
      conversationId: conversation.id,
      userId: {
        [Op.not]: senderId,
      },
    },
    raw: true,
  });

  // Create Message...
  const msg = await models.Message.create({
    senderId,
    receiverId: receiverId.userId,
    conversationId,
    message,
  });

  return conversation.roomId;

  // const conversationObj = {
  //   name: receiver.userName,
  //   isGroup: false,
  //   isChannel: false,
  //   roomId,
  // };

  // const senderReceiver = await models.Message.findOne({
  //   where: { senderId, receiverId },
  // });

  // // Creating New Conversation...
  // if (!senderReceiver) {
  //   const conversation = await models.Conversation.create(conversationObj);
  //   const userCon = await models.UserConversation.bulkCreate([
  //     {
  //       userId: senderId,
  //       conversationId: conversation.id,
  //     },
  //     {
  //       userId: receiverId,
  //       conversationId: conversation.id,
  //     },
  //   ]);

  //   if (!conversation || !userCon)
  //     return Logger.error('Conversation not created!');

  //   // saving message...
  //   await models.Message.create({
  //     senderId,
  //     receiverId,
  //     message,
  //     conversationId: conversation.id,
  //   });
  //   return conversation.roomId;
  // }

  // // Updating Existing Conversation...
  // // const conversation = await models.Conversation.findOne({
  // //   where: { id: senderReceiver.conversationId },
  // // });

  // // saving message...
  // await models.Message.create({
  //   senderId,
  //   receiverId,
  //   message,
  //   conversationId: conversation.id,
  // });

  // return conversation.roomId;
};

export const onReceived = async (data) => {
  Logger.info('onReceived Socket Method');
  const { senderId, receiverId } = data;
  console.log(senderId, receiverId);

  try {
    const { count, rows } = await models.Message.findAndCountAll({
      where: { receiverId, isRead: false },
      order: [['createdAt', 'DESC']],
    });

    return {
      senderId: senderId,
      totalUnreadMsgs: count,
      unReadMsgs: rows,
    };
  } catch (error) {
    return Logger.error(error);
  }
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
