/* eslint-disable indent */
import { Logger } from '../../utils/logger.js';
import { errorObject } from '../../utils/errorObject.js';
import { models } from '../../config/dbConnection.js';
import { generateRoomID } from '../../utils/helper/index.js';
import { Op } from 'sequelize';
import { generateInvitationCode } from '../../utils/helper/inviteLink.js';
import { EnvConfig } from '../../config/envConfig.js';

// Fetch all single, group and channel chat...
export const getDashboardService = async (data) => {
  Logger.info('Get DashBoard service triggered');
  const { id } = data;

  // updating messages sent to delivered...
  await models.Message.update(
    { status: 'delivered' },
    { where: { receiverId: id, status: 'sent' } },
  );

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
            where: { status: 'delivered' },
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

  // fetching specific conversation messages...
  const user = await models.Message.findAll({
    where: { conversationId: conversationId },
    limit: limit,
    offset: offset,
    order: [['createdAt', 'DESC']],
    raw: true,
  });

  // updating all messages delivered to seen...
  await models.Message.update(
    { status: 'seen' },
    { where: { conversationId: conversationId } },
  );

  // count total messages....
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
      status: 'delivered',
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

  // Generating group Invitation Link...
  const code = generateInvitationCode(groupName);
  const inviteLink = `http://${EnvConfig.ip}:${EnvConfig.port}/${EnvConfig.api.prefix}/chat/joinGroup/${code}`;

  // Creating Group Conversation...
  const group = await models.Conversation.create({
    name: groupName,
    description,
    type: 'private',
    isGroup: true,
    roomId,
    participants: totalParticipants,
    inviteLink,
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
  if (!userCon) {
    throw errorObject('Failed to add users in the group conversation');
  }

  return group;
};

export const fetchInviteLinkService = async (userId, data) => {
  Logger.info('Fetch Invite Link Service Triggered');

  const { conversationId } = data;

  // verifying user in group conversation...
  const userCon = await models.UserConversation.findOne({
    where: { userId: userId, conversationId: conversationId },
  });
  if (!userCon) throw errorObject('user not in group');

  // finding group invite link...
  const group = await models.Conversation.findOne({
    where: { id: conversationId },
    raw: true,
  });

  return group.inviteLink;
};

export const joinGroupLinkService = async (userId, data) => {
  Logger.info('Join Group with Link Service Triggered');

  const { code } = data;

  const inviteLink = `http://${EnvConfig.ip}:${EnvConfig.port}/api/chat/joinGroup/${code}`;

  // verifying group conversation...
  const group = await models.Conversation.findOne({ where: { inviteLink } });

  if (group.isGroup == false) {
    throw errorObject('Group not exists!', 'notFound');
  }

  // checking user already joined or not...
  const user = await models.UserConversation.findOne({
    where: { userId: userId, conversationId: group.id },
  });

  if (user) {
    throw errorObject(`you are already the group.`, 'duplication');
  }

  // joining new user to group conversation...
  const userCon = await models.UserConversation.create({
    userId,
    conversationId: group.id,
  });
  if (!userCon) throw errorObject('Failed to Join');

  await models.Conversation.update(
    { participants: group.participants + 1 },
    { where: { id: group.id } },
  );

  return true;
};

export const joinGroupService = async (userId, data) => {
  const { conversationId, userIds } = data;

  // verifying group...
  const group = await models.Conversation.findOne({
    where: { id: conversationId },
  });
  if (!group) throw errorObject('Group not Exists');

  // verifying user how is inviting is admin or not...
  const user = await models.UserConversation.findOne({
    where: { userId: userId, conversationId: conversationId, isAdmin: true },
  });
  if (!user) throw errorObject('user must be admin', 'unAuthorized');

  const userArr = [];
  // merging userIds with conversationId...
  const promises = userIds.map(async (userId) => {
    // verifying user already in group or not...
    const userInCon = await models.UserConversation.findOne({
      where: { userId: userId, conversationId: conversationId },
    });

    if (!userInCon) {
      const newUser = {
        userId: userId,
        conversationId: conversationId,
      };

      userArr.push(newUser);
    }
  });
  await Promise.all(promises);

  const newUsersCount = userArr.length;
  console.log(newUsersCount);

  // adding users to the group...
  const addToGroup = await models.UserConversation.bulkCreate(userArr);
  console.log(addToGroup);
  if (!addToGroup) throw errorObject('Failed to Join');

  // updating numbers of participants in the group...
  await models.Conversation.update(
    { participants: group.participants + newUsersCount },
    { where: { id: conversationId } },
  );

  return addToGroup;
};

export const leaveGroupService = async (userId, data) => {
  Logger.info('Leave Group Service Triggered');
  const { conversationId } = data;

  // verifying group conversation...
  const group = await models.Conversation.findByPk(conversationId);
  if (group.isGroup == false) {
    throw errorObject('Group not exists!', 'notFound');
  }

  // removing user from group conversation...
  let user = await models.UserConversation.findOne({
    where: { userId: userId, conversationId: conversationId },
    // raw: true,
  });

  user = JSON.parse(JSON.stringify(user));
  console.log(user);
  if (!user) throw errorObject('Failed to leave the group or user not found!');

  // newAdmin...
  if (user.isAdmin === true) {
    const newAdmin = await models.UserConversation.update(
      { isAdmin: true },
      { where: { isAdmin: false }, limit: 1 },
    );
    console.log(newAdmin);
  }

  const leavedUser = await models.UserConversation.destroy({
    where: { userId: userId, conversationId: conversationId },
  });
  console.log(leavedUser);

  // updating participants in group conversation...
  await models.Conversation.update(
    { participants: group.participants - 1 },
    { where: { id: conversationId } },
  );

  return leavedUser;
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
  if (!groupAdmin) {
    throw errorObject('User is not authorized to create Admin', 'forbidden');
  }

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

  const { channelName, description, participants } = data;

  const roomId = generateRoomID(8);

  const totalParticipants = participants.reduce((acc, cv) => {
    return acc + cv;
  }, 1);

  // Creating Channel Conversation...
  const channel = await models.Conversation.create({
    name: channelName,
    description,
    type: 'public',
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
  if (channel.isChannel == false) {
    throw errorObject('Channel not exists!', 'notFound');
  }

  const user = await models.UserConversation.findOne({
    where: { userId, conversationId },
  });

  if (user) {
    throw errorObject(
      `user with id ${userId} already joined the group.`,
      'duplication',
    );
  }

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
  let data = channels.filter(async (val) => {
    const channelId = val.id;
    const userInChannel = await models.UserConversation.findAll({
      where: { userId: userId, conversationId: channelId },
    });
    return userInChannel;
  });
  data = JSON.parse(JSON.stringify(data));
  if (data.length === 0) return 'Their is no Channels!';

  return data;
};
