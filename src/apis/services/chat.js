import { Logger } from '../../utils/logger.js';
import { errorObject } from '../../utils/errorObject.js';
import { models } from '../../config/dbConnection.js';
import { generateRoomID } from '../../utils/helper/index.js';

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
