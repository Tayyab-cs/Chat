import { Logger } from '../../utils/logger.js';
import { errorObject } from '../../utils/errorObject.js';
import { models } from '../../config/dbConnection.js';
import { generateRoomID } from '../../utils/helper/index.js';

export const joinGroupService = async (userId, data) => {
  const { users } = data;
  console.log(userId, users);

  const user = await models.Conversation.findOne({
    where: { userId: userId, conversationId: conversationId, isAdmin: true },
  });
  console.log(user);
  if (!user) throw errorObject('user must be admin', 'unAuthorized');

  const userConPayload = users.map((user) => {
    return {
      userId: user.userId,
      conversationId: conversationId,
    };
  });

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
    if (!user)
      throw errorObject('Failed to leave the group or user not found!');

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
};
