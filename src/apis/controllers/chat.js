import { Logger } from '../../utils/logger.js';
import {
  createGroupService,
  joinGroupService,
  createChannelService,
  joinChannelService,
  findUser,
  getGroupService,
  getChannelService,
  getDashboardService,
  fetchChatService,
  unreadChatService,
} from '../services/index.js';

// GROUP APIs
export const createGroup = async (req, res, next) => {
  Logger.info('Create Group Controller Triggered');
  const { id } = req.user;
  try {
    const group = await createGroupService(req.body);
    if (!group) throw new Error('Failed to create a group!');
    Logger.info('Group Created Successfully');
    return res.status(201).json({
      success: true,
      message: 'Group Created Successfully',
    });
  } catch (error) {
    return next(error);
  }
};

export const joinGroup = async (req, res, next) => {
  Logger.info('Join Group Controller Triggered');
  try {
    const group = await joinGroupService(req.body);
    if (!group) throw new Error('Failed to join!');
    Logger.info('Group Joined Successfully');
    return res.status(201).json({
      success: true,
      message: 'Group Joined Successfully',
    });
  } catch (error) {
    return next(error);
  }
};

export const getGroups = async (req, res, next) => {
  Logger.info('Get Group Controller Triggered');

  try {
    const data = await getGroupService(req.user);
    Logger.info('Group fetched Successfully');
    return res.status(201).json({
      success: true,
      message: 'Group fetched Successfully',
      result: { data },
    });
  } catch (error) {
    return next(error);
  }
};

// CHANNEL APIs
export const createChannel = async (req, res, next) => {
  const { email } = req.user;
  try {
    const user = await findUser(email);
    const channelData = {
      creatorId: user.id,
      ...req.body,
    };
    const channel = await createChannelService(channelData);
    if (!channel) throw new Error('Failed to create a channel!');
    Logger.info('Channel created Successfully');
    return res.status(201).json({
      success: true,
      message: 'Channel created Successfully',
      result: channel,
    });
  } catch (error) {
    return next(error);
  }
};

export const joinChannel = async (req, res, next) => {
  const { email } = req.user;
  try {
    const user = await findUser(email);
    const channelData = {
      userId: user.id,
      ...req.body,
    };
    const channel = await joinChannelService(channelData);
    if (!channel) throw new Error('Failed to join a channel!');
    Logger.info('Channel Joined Successfully');
    return res.status(201).json({
      success: true,
      message: 'Channel Joined Successfully',
    });
  } catch (error) {
    return next(error);
  }
};

export const getChannels = async (req, res, next) => {
  Logger.info('Get Channels Controller Triggered');
  try {
    const channels = await getChannelService(req.query);
    console.log(channels);
    Logger.info('Channels fetched Successfully');
    return res.status(201).json({
      success: true,
      message: 'Channels fetched Successfully',
      result: channels,
    });
  } catch (error) {
    return next(error);
  }
};

// DASHBOARD
export const dashboard = async (req, res, next) => {
  Logger.info('Dashboard Controller Triggered');
  try {
    const userData = await getDashboardService(req.user);
    Logger.info('userData fetched Successfully');
    return res.status(201).json({
      success: true,
      message: 'userData fetched Successfully',
      result: { userData },
    });
  } catch (error) {
    console.log('.........................');
    console.log(error);
    return next(error);
  }
};

// Fetch Chat...
export const fetchChat = async (req, res, next) => {
  Logger.info('Fetch Chat Controller Triggered');
  const { id } = req.user;
  const { conversationId } = req.params;
  const { page, limit } = req.query;

  console.log(id, conversationId);

  try {
    const data = await fetchChatService(id, conversationId, page, limit);
    Logger.info('Chat fetched Successfully');
    return res.status(201).json({
      success: true,
      message: 'Chat fetched Successfully',
      result: { data },
    });
  } catch (error) {
    return next(error);
  }
};

// Fetch unRead Chat...
export const unreadChat = async (req, res, next) => {
  Logger.info('UnRead Chat Controller Triggered');
  const { id } = req.user;
  const { receiverId } = req.params;

  try {
    const data = await unreadChatService(id, receiverId);
    Logger.info('UnRead Chat fetched Successfully');
    return res.status(201).json({
      success: true,
      message: 'UnRead Chat fetched Successfully',
      result: { data },
    });
  } catch (error) {
    return next(error);
  }
};
