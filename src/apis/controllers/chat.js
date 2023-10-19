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
} from '../services/index.js';

// GROUP APIs
export const createGroup = async (req, res, next) => {
  Logger.info('Create Group Controller Triggered');
  try {
    const group = await createGroupService(req.body);
    if (!group) throw new Error('Failed to create a group!');
    Logger.info('Group Created Successfully');
    return res.status(201).json({
      success: true,
      message: '==> Group Created Successfully',
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
      message: '==> Group Joined Successfully',
    });
  } catch (error) {
    return next(error);
  }
};

export const getGroups = async (req, res, next) => {
  Logger.info('Get Group Controller Triggered');
  try {
    const groups = await getGroupService(req.query);
    Logger.info('Group fetched Successfully');
    return res.status(201).json({
      success: true,
      message: 'Group fetched Successfully',
      groups,
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
      message: '==> Channel created Successfully',
      channel,
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
      message: '==> Channel Joined Successfully',
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
      channels,
    });
  } catch (error) {
    return next(error);
  }
};

// DASHBOARD
export const dashboard = async (req, res, next) => {
  Logger.info('Dashboard Controller Triggered');
  try {
    const channels = await getDashboardService(req.user);
    console.log(channels);
    Logger.info('Channels fetched Successfully');
    return res.status(201).json({
      success: true,
      message: 'Channels fetched Successfully',
      channels,
    });
  } catch (error) {
    return next(error);
  }
};
