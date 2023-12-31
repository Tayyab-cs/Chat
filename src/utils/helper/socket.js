/* eslint-disable indent */
// eslint-disable-next-line object-curly-spacing
import { Logger } from '../logger.js';
import { models } from '../../config/dbConnection.js';
import { sequelize } from '../../config/dbConnection.js';
import { Op } from 'sequelize';

export const onOnline = async (data) => {
  const { socketId, senderId } = data;
  const t = await sequelize.transaction();
  try {
    // find user...
    const user = await models.User.update(
      { socketId, isOnline: true },
      { where: { id: senderId } },
      { transaction: t },
    );
    if (!user) return Logger.error('Sender not Found!');

    const { count, rows } = await models.Message.findAndCountAll(
      {
        where: { receiverId: senderId, status: 'delivered' },
        order: [['createdAt', 'DESC']],
      },
      { transaction: t },
    );

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
      { status: 'seen' },
      {
        where: {
          receiverId: userId,
          conversationId: conversation.id,
          status: 'delivered',
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

  try {
    // Verify User...
    const sender = await models.User.findOne({
      where: { id: senderId },
      raw: true,
    });
    console.log('senderId: ', sender.id);
    if (!sender) return Logger.error('sender not exists!');

    // Verify Conversation...
    const [conversation] = await models.Conversation.findOrCreate({
      where: { id: conversationId },
      raw: true,
    });

    // finding receiver...
    const receiverId = await models.UserConversation.findOne({
      where: {
        conversationId: conversation.id,
        userId: {
          [Op.not]: senderId,
        },
      },
      raw: true,
    });
    console.log('receiverId: ', receiverId.userId);

    // Create Message...
    await models.Message.create({
      senderId,
      receiverId: receiverId.userId,
      conversationId,
      message,
      status: 'sent',
    });

    const newData = {
      senderId: sender.id,
      receiverId: receiverId.userId,
      message: message,
      roomId: conversation.roomId,
    };

    return newData;
  } catch (error) {
    return Logger.error(error);
  }
};

export const onReceived = async (data) => {
  Logger.info('onReceived Socket Method');
  const { senderId, receiverId } = data;
  console.log(senderId, receiverId);

  try {
    const { count, rows } = await models.Message.findAndCountAll({
      where: { receiverId, status: 'delivered' },
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
  Logger.info('Group Message Method Socket Triggered');

  const { senderId, conversationId, message } = data;

  try {
    if (message === null) {
      return Logger.error('message cannot be null');
    }
    // finding user...
    const user = await models.User.findOne({ where: { id: senderId } });

    // finding group conversation...
    const con = await models.Conversation.findOne({
      where: { id: conversationId },
    });
    if (!con || !con.isGroup) return Logger.error('Group not exists!');

    // verifying user in group conversation...
    const userCon = await models.UserConversation.findOne({
      where: { userId: senderId, conversationId },
    });
    if (!userCon) return Logger.error('user not a member of group');

    // saving message...
    await models.Message.create({
      senderId,
      conversationId,
      message,
    });

    // returing object...
    const result = {
      senderId: senderId,
      conversationId: conversationId,
      message: message,
      roomId: con.roomId,
      sender: {
        userName: user.userName,
        email: user.email,
        avatarImage: user.avatarImage,
      },
    };

    return result;
  } catch (error) {
    return Logger.error(error);
  }
};

export const onChannelMessage = async (data) => {
  const { senderId, conversationId, message } = data;

  try {
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
  } catch (error) {
    return Logger.error(error);
  }
};

export const onMessageDelivered = async (data) => {
  const { userId, conversationId } = data;

  try {
    let userOnline = await models.User.findOne({ where: { id: userId } });

    userOnline = JSON.parse(JSON.stringify(userOnline));

    if (userOnline.isOnline === true) {
      await models.Message.update(
        { status: 'delivered' },
        {
          where: {
            status: 'sent',
            receiverId: userId,
            conversationId: conversationId,
          },
        },
      );
      return {
        userId: userId,
        conversationId: conversationId,
        isOnline: userOnline.isOnline,
        message: 'message delivered successfully',
      };
    }
  } catch (error) {
    return Logger.error(error);
  }
};

export const onMessageSeen = async (data) => {
  const { userId, conversationId } = data;

  try {
    let userOnline = await models.User.findOne({ where: { id: userId } });

    userOnline = JSON.parse(JSON.stringify(userOnline));

    let userCon = await models.UserConversation.findOne({
      where: { userId: userId, conversationId: conversationId },
    });
    userCon = JSON.parse(JSON.stringify(userCon));

    if (userOnline.isOnline === true && userCon) {
      await models.Message.update(
        { status: 'seen' },
        {
          where: {
            [Op.or]: [{ status: 'sent' }, { status: 'delivered' }],
            receiverId: userId,
            conversationId: conversationId,
          },
        },
      );
      return {
        userId: userId,
        conversationId: conversationId,
        isOnline: userOnline.isOnline,
        message: 'message seen successfully',
      };
    }
  } catch (error) {
    return Logger.error(error);
  }
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
