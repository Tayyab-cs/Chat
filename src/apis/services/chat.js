import { Logger } from '../../utils/logger.js';
import { errorObject } from '../../utils/errorObject.js';
import { models } from '../../config/dbConnection.js';
import { generateRoomID } from '../../utils/helper/index.js';
import { Op, fn, literal } from 'sequelize';

// GROUP SERVICES...
export const createGroupService = async (data) => {
  const { groupName, description, creatorId, participants } = data;

  const roomId = generateRoomID(8);

  const totalParticipants = participants.reduce((acc, cv) => {
    return acc + 1;
  }, 1);

  // Creating Group Conversation...
  const group = await models.Conversation.create({
    name: groupName,
    description,
    isGroup: true,
    roomId,
    participants: totalParticipants,
  });
  if (!group) throw errorObject('Failed to create a conversation');

  // merging createdId with other added user Ids...
  const userIDs = participants.map((participant) => participant.userId);
  const mergedUserIds = [creatorId, ...userIDs];

  // merging group Id with each userID
  const resultArray = mergedUserIds.map((userId) => ({
    userId: userId,
    conversationId: group.id,
  }));

  // Creating userConversation Records...
  const userCon = await models.UserConversation.bulkCreate(resultArray);
  if (!userCon) throw errorObject('Failed to add users in the conversation');

  return true;
};

export const joinGroupService = async (data) => {
  const { userId, conversationId } = data;

  const group = await models.Conversation.findByPk(conversationId);
  if (group.isGroup == false) throw errorObject('==> Group not exists!');

  const user = await models.UserConversation.findOne({
    where: { userId, conversationId },
  });
  if (user)
    throw errorObject(`user with id ${userId} already joined the group.`);

  const userCon = await models.UserConversation.create({
    userId,
    conversationId,
  });
  if (!userCon) throw errorObject('Failed to Join');
  return true;
};

export const getGroupService = async (userId) => {
  Logger.info('Get Group Service Triggered');
  const { id } = userId;
  const groups = await models.Conversation.findAll({
    where: { isGroup: true },
  });
  const data = groups.filter(async (val) => {
    const groupId = val.id;
    const userInGroup = await models.UserConversation.findAll({
      where: { userId: id, conversationId: groupId },
    });
    return userInGroup;
  });
  return data;
};

// CHANNEL APIS...
export const createChannelService = async (data) => {
  const { creatorId, channelName, description, type, participants } = data;

  const roomId = generateRoomID(8);

  const totalParticipants = participants.reduce((acc, cv) => {
    return acc + 1;
  }, 1);

  const publicCon = await models.Conversation.create({
    name: channelName,
    description,
    type,
    isGroup: false,
    isChannel: true,
    roomId,
    participants: totalParticipants,
  });

  if (!publicCon) throw errorObject('Channel creation failed!');
  const userCon = await models.UserConversation.create({
    userId: creatorId,
    conversationId: publicCon.id,
  });
  if (!userCon) throw errorObject('Failed to add admin in the Channel');
  return publicCon;
};

export const joinChannelService = async (data) => {
  const { userId, conversationId } = data;
  const channel = await models.Conversation.findByPk(conversationId);
  if (channel.isChannel == false) throw errorObject('==> Channel not exists!');

  const user = await models.UserConversation.findOne({
    where: { userId, conversationId },
  });

  if (user)
    throw errorObject(
      `user with id ${userId} already joined the group.`,
      'duplication',
    );

  const userCon = await models.UserConversation.create({
    userId,
    conversationId,
  });
  if (!userCon) throw errorObject('Failed to Join');
  return userCon;
};

export const getChannelService = async (data) => {
  Logger.info('Get Channel Service Triggered');
  let { isChannel } = data;
  console.log(isChannel);
  isChannel = Boolean(isChannel);
  let channels = await models.Conversation.findAndCountAll({
    where: {
      isChannel,
    },
    raw: true,
  });
  // channels = JSON.parse(JSON.stringify(channels));
  console.log(channels);
  return channels;
};

export const getDashboardService = async (data) => {
  Logger.info('Get DashBoard service triggered');
  const { id } = data;

  // User...
  let userData = await models.User.findOne({
    where: { id },
    include: [
      {
        required: false,
        model: models.Conversation,
        as: 'conversations',
        include: [
          {
            required: false,
            model: models.Message,
            as: 'messages',
            where: { isRead: false },
          },
        ],
      },
    ],
    distinct: true,
  });
  userData = JSON.parse(JSON.stringify(userData));
  console.log(userData);

  // mapping user conversations...
  const conversation = userData.conversations.map((data) => {
    console.log('-------------------------------');
    console.dir(data, { depth: null });
    console.log('-------------------------------');

    return {
      id: data.id,
      name: data.name,
      type: data.type,
      isgroup: data.isGroup,
      ischannel: data.isChannel,
      participants: data.participants,
      roomid: data.roomId,
      message: data.messages.map((msg) => msg.message),
      unreadMsgs: data.messages.length,
    };
  });

  const singleChat = [];
  const group = [];
  const channel = [];

  const user = conversation.map(async (data) => {
    if (data.isgroup == true) {
      group.push(data);
    } else if (data.ischannel == true) {
      channel.push(data);
    } else {
      singleChat.push(data);
    }

    return {
      singlechat: singleChat,
      group: group,
      channel: channel,
    };
  });

  console.dir('----------------------');
  // console.dir(user[0], { depth: null });
  console.dir('----------------------');
  return user[0];
};

export const fetchChatService = async (
  senderId,
  conversationId,
  page,
  limit,
) => {
  Logger.info('Fetch Chat Service Triggered');

  page = parseInt(page, 10);
  limit = parseInt(limit, 10);

  const offset = (page - 1) * limit;

  const user = await models.Message.findAll({
    where: { conversationId: conversationId },
    limit: limit,
    offset: offset,
    order: [['createdAt', 'DESC']],
    raw: true,
  });
  const totalChat = await models.Message.findAll({
    where: { conversationId: conversationId },
  });
  const count = totalChat.length;

  const data = {
    user,
    count,
  };

  return data;
};

export const unreadChatService = async (senderId, receiverId) => {
  const msg = await models.Message.findAll({
    where: {
      [Op.or]: [
        { senderId: senderId, receiverId: receiverId },
        { senderId: receiverId, receiverId: senderId },
      ],
      isRead: false,
    },
  });

  return msg;
};
