import { Logger } from '../../utils/logger.js';
import {
  createGroupService,
  joinGroupService,
  createChannelService,
  joinChannelService,
  findUser,
} from '../services/index.js';

export const createGroup = async (req, res, next) => {
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
