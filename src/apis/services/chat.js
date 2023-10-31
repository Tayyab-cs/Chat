import { Logger } from '../../utils/logger.js';
import { errorObject } from '../../utils/errorObject.js';
import { models } from '../../config/dbConnection.js';
import { generateRoomID } from '../../utils/helper/index.js';
import { Op, fn, literal } from 'sequelize';

// Fetch all single, group and channel chat...
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

  // mapping user conversations...
  const conversation = userData.conversations.map((data) => {
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

  // console.dir('----------------------');
  // console.dir(user[0], { depth: null });
  // console.dir('----------------------');
  return user[0];
};

// Fetch specific conversation chat...
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

// Fetch unRead Messages...
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

// GROUP SERVICES...
export const createGroupService = async (userId, data) => {
  const { groupName, description, participants } = data;

  const roomId = generateRoomID(8);

  const totalParticipants = participants.reduce((acc, cv) => {
    return acc + cv;
  }, 1);

  // Creating Group Conversation...
  const group = await models.Conversation.create({
    name: groupName,
    description,
    isGroup: true,
    roomId,
    participants: totalParticipants,
  });
  if (!group) throw errorObject('Failed to create a group conversation');

  // merging userId with other added participant Ids...
  const userIDs = participants.map((participant) => participant.userId);
  const mergedUserIds = [userId, ...userIDs];

  // merging group Id with each userID
  const resultArray = mergedUserIds.map((id) => ({
    userId: id,
    conversationId: group.id,
    isAdmin: id === userId,
  }));

  // Creating userConversation Records...
  const userCon = await models.UserConversation.bulkCreate(resultArray);
  if (!userCon)
    throw errorObject('Failed to add users in the group conversation');

  return group;
};

export const joinGroupService = async (userId, data) => {
  Logger.info('Join Group Service Triggered');

  const { conversationId } = data;
  console.log(userId, conversationId);

  // verifying group conversation...
  const group = await models.Conversation.findByPk(conversationId);
  console.log('group: ', group);
  if (group.isGroup == false)
    throw errorObject('Group not exists!', 'notFound');

  // checking user already joined or not...
  const user = await models.UserConversation.findOne({
    where: { userId: userId, conversationId: conversationId },
  });
  console.log('user: ', user);
  if (user)
    throw errorObject(
      `user with id ${userId} already joined the group.`,
      'duplication',
    );

  // joining new user to group conversation...
  const userCon = await models.UserConversation.create({
    userId,
    conversationId,
  });
  console.log('userCOn: ', userCon);
  if (!userCon) throw errorObject('Failed to Join');

  const updateParticipants = await models.Conversation.update(
    { participants: group.participants + 1 },
    { where: { id: conversationId } },
  );
  console.log('updateParticipants', updateParticipants);

  return true;
};

export const leaveGroupService = async (userId, data) => {
  Logger.info('Leave Group Service Triggered');
  const { conversationId } = data;

  // verifying group conversation...
  const group = await models.Conversation.findByPk(conversationId);
  if (group.isGroup == false)
    throw errorObject('Group not exists!', 'notFound');

  // removing user from group conversation...
  const delUser = await models.UserConversation.destroy({
    where: { userId: userId, conversationId: conversationId },
  });
  if (!delUser)
    throw errorObject('Failed to leave the group or user not found!');

  // updating participants in group conversation...
  await models.Conversation.update(
    { participants: group.participants - 1 },
    { where: { id: conversationId } },
  );

  return delUser;
};

export const getGroupService = async (userId) => {
  Logger.info('Get Group Service Triggered');

  const groups = await models.Conversation.findAll({
    where: { isGroup: true },
  });
  const data = groups.filter(async (val) => {
    const groupId = val.id;
    const userInGroup = await models.UserConversation.findAll({
      where: { userId: userId, conversationId: groupId },
    });
    return userInGroup;
  });
  if (data.length === 0) return 'Their is no Group!';
  return data;
};

export const updateAdminService = async (userId, data) => {
  Logger.info('Update Group Admin Service Triggered');
  const { memberId, conversationId, isAdmin } = data;

  // verifying current user is admin or not...
  const groupAdmin = await models.UserConversation.findOne({
    where: { userId: userId, conversationId: conversationId, isAdmin: true },
  });
  if (!groupAdmin)
    throw errorObject('User is not authorized to create Admin', 'forbidden');

  // creating new admin...
  const updateAdmin = await models.UserConversation.update(
    { isAdmin: isAdmin },
    { where: { userId: memberId, conversationId: conversationId } },
  );
  if (!updateAdmin) throw errorObject('Failed to Create Admin');

  return updateAdmin;
};

export const fetchGroupChatService = async (
  senderId,
  conversationId,
  page,
  limit,
) => {
  Logger.info('Fetch Group Chat Service Triggered');

  page = parseInt(page, 10);
  limit = parseInt(limit, 10);

  const offset = (page - 1) * limit;

  const userMsg = await models.Message.findAll({
    where: { conversationId: conversationId },
    include: [
      {
        attributes: ['id', 'userName', 'email', 'avatarImage'],
        required: false,
        model: models.User,
        as: 'sender',
      },
    ],
    limit: limit,
    offset: offset,
    order: [['createdAt', 'DESC']],
  });
  console.log(userMsg);

  const totalChat = await models.Message.findAll({
    where: { conversationId: conversationId },
  });

  const count = totalChat.length;

  const data = {
    userMsg,
    count,
  };

  return data;
};

// CHANNEL APIS...
export const createChannelService = async (userId, data) => {
  Logger.info('Create Channel Service Triggered');

  const { channelName, description, type, participants } = data;

  const roomId = generateRoomID(8);

  const totalParticipants = participants.reduce((acc, cv) => {
    return acc + cv;
  }, 1);

  // Creating Channel Conversation...
  const channel = await models.Conversation.create({
    name: channelName,
    description,
    type,
    isGroup: false,
    isChannel: true,
    roomId,
    participants: totalParticipants,
  });
  if (!channel) throw errorObject('Channel creation failed!');

  // merging userId with other added participant Ids...
  const userIDs = participants.map((participant) => participant.userId);
  const mergedUserIds = [userId, ...userIDs];

  // merging channel Id with each userID
  const resultArray = mergedUserIds.map((id) => ({
    userId: id,
    conversationId: channel.id,
    isAdmin: id === userId,
  }));

  // Creating UserConversation records...
  const userCon = await models.UserConversation.bulkCreate(resultArray);
  if (!userCon) throw errorObject('Failed to add admin in the Channel');

  return channel;
};

export const joinChannelService = async (data) => {
  Logger.info('Join Channel Service Triggered');

  const { userId, conversationId } = data;
  const channel = await models.Conversation.findByPk(conversationId);
  if (channel.isChannel == false)
    throw errorObject('Channel not exists!', 'notFound');

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

export const getChannelService = async (userId) => {
  Logger.info('Get Channel Service Triggered');

  // finding channel...
  const channels = await models.Conversation.findAll({
    where: { isChannel: true },
  });

  // finding user and channels in userConversation...
  const data = channels.filter(async (val) => {
    const channelId = val.id;
    const userInChannel = await models.UserConversation.findAll({
      where: { userId: userId, conversationId: channelId },
    });
    return userInChannel;
  });
  if (data.length === 0) return 'Their is no Channels!';

  return data;
};
